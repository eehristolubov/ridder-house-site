document.getElementById('year').textContent = new Date().getFullYear();

const body = document.body;
const header = document.getElementById('site-header');
const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('site-nav');

function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  nav.classList.toggle('open', open);
  header.classList.toggle('menu-active', open);
  body.classList.toggle('menu-open', open);
  if (open) nav.querySelector('a').focus();
}

menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

window.addEventListener('resize', () => {
  if (window.innerWidth > 900 && menuToggle.getAttribute('aria-expanded') === 'true') setMenu(false);
});

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 24);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

/* Quiet, one-time section reveals with a no-script-safe fallback. */
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px' });
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}

/* Accessible gallery lightbox. */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxCount = document.getElementById('lightbox-count');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');
const lightboxTriggers = [...document.querySelectorAll('[data-lightbox]')];
let activeImage = 0;
let lastFocusedElement = null;
let touchStartX = 0;

function renderLightbox() {
  const trigger = lightboxTriggers[activeImage];
  lightboxImg.src = trigger.dataset.lightbox;
  lightboxImg.alt = trigger.dataset.alt || '';
  lightboxCaption.textContent = trigger.dataset.caption || trigger.dataset.alt || '';
  lightboxCount.textContent = `${String(activeImage + 1).padStart(2, '0')} / ${String(lightboxTriggers.length).padStart(2, '0')}`;
}

function openLightbox(index) {
  lastFocusedElement = document.activeElement;
  activeImage = index;
  renderLightbox();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  body.classList.add('lightbox-open');
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  body.classList.remove('lightbox-open');
  lightboxImg.src = '';
  if (lastFocusedElement) lastFocusedElement.focus();
}

function moveLightbox(direction) {
  activeImage = (activeImage + direction + lightboxTriggers.length) % lightboxTriggers.length;
  renderLightbox();
}

lightboxTriggers.forEach((trigger, index) => trigger.addEventListener('click', () => openLightbox(index)));
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => moveLightbox(-1));
lightboxNext.addEventListener('click', () => moveLightbox(1));
lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
lightbox.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
lightbox.addEventListener('touchend', event => {
  const distance = event.changedTouches[0].screenX - touchStartX;
  if (Math.abs(distance) > 50) moveLightbox(distance > 0 ? -1 : 1);
}, { passive: true });

document.addEventListener('keydown', event => {
  const menuIsOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  const lightboxIsOpen = lightbox.classList.contains('open');

  if (event.key === 'Escape' && lightboxIsOpen) closeLightbox();
  else if (event.key === 'Escape' && menuIsOpen) {
    setMenu(false);
    menuToggle.focus();
  } else if (lightboxIsOpen && event.key === 'ArrowLeft') moveLightbox(-1);
  else if (lightboxIsOpen && event.key === 'ArrowRight') moveLightbox(1);

  if (event.key !== 'Tab') return;
  const activeContainer = lightboxIsOpen ? lightbox : (menuIsOpen ? header : null);
  if (!activeContainer) return;
  const focusable = [...activeContainer.querySelectorAll('a[href], button:not([disabled]), input:not([disabled])')]
    .filter(element => element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

/* Contact form → Telegram relay. */
const TELEGRAM_RELAY_URL = 'https://ridder-house-site-relay.vercel.app/api/telegram';
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

form.addEventListener('submit', async event => {
  event.preventDefault();
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const submitButton = form.querySelector('button[type="submit"]');

  form.name.setAttribute('aria-invalid', String(!name));
  form.phone.setAttribute('aria-invalid', String(!phone));

  if (!name || !phone) {
    status.textContent = 'Пожалуйста, заполните имя и телефон.';
    status.className = 'form-status error';
    (!name ? form.name : form.phone).focus();
    return;
  }

  submitButton.disabled = true;
  status.textContent = 'Отправляем запрос…';
  status.className = 'form-status';

  try {
    const response = await fetch(TELEGRAM_RELAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || 'Relay error');

    status.textContent = 'Спасибо. Запрос отправлен, мы свяжемся с вами в ближайшее время.';
    status.className = 'form-status success';
    form.reset();
    form.name.setAttribute('aria-invalid', 'false');
    form.phone.setAttribute('aria-invalid', 'false');
  } catch (error) {
    status.textContent = 'Не удалось отправить запрос. Пожалуйста, попробуйте ещё раз.';
    status.className = 'form-status error';
  } finally {
    submitButton.disabled = false;
  }
});
