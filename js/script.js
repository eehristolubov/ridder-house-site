document.getElementById('year').textContent = new Date().getFullYear();

/* Mobile nav */
const burger = document.getElementById('burger');
const header = document.getElementById('site-header');
burger.addEventListener('click', () => header.classList.toggle('open'));
document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => header.classList.remove('open'));
});

/* Header shrink + scroll progress + floating CTA */
const progressBar = document.getElementById('scroll-progress');
const floatingCta = document.getElementById('floating-cta');
const heroHeight = () => document.querySelector('.hero').offsetHeight;

let ticking = false;
function onScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = progress + '%';

  header.classList.toggle('scrolled', scrollTop > 20);
  floatingCta.classList.toggle('visible', scrollTop > heroHeight() * 0.8);

  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });
onScroll();

/* Scroll reveal */
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}

/* Animated counters */
const counters = document.querySelectorAll('.counter');
function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const elapsed = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - elapsed, 3);
    const value = target * eased;
    el.textContent = value.toFixed(decimals);
    if (elapsed < 1) requestAnimationFrame(tick);
    else el.textContent = target.toFixed(decimals);
  }
  requestAnimationFrame(tick);
}

if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(c => counterObserver.observe(c));
} else {
  counters.forEach(c => { c.textContent = parseFloat(c.dataset.count).toFixed(parseInt(c.dataset.decimals || '0', 10)); });
}

/* Gallery lightbox */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

document.querySelectorAll('.gallery-photo img').forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('open');
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxImg.src = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

/* Contact form -> Telegram */
const TELEGRAM_BOT_TOKEN = 'ВСТАВЬТЕ_ТОКЕН_БОТА';
const TELEGRAM_CHAT_ID = 'ВСТАВЬТЕ_CHAT_ID';

const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const phone = form.phone.value.trim();

  if (!name || !phone) {
    status.textContent = 'Пожалуйста, заполните имя и телефон.';
    status.className = 'form-status error';
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  status.textContent = 'Отправляем...';
  status.className = 'form-status';

  const text =
    'Новая заявка с сайта «Кедровская, 36А»%0A' +
    'Имя: ' + encodeURIComponent(name) + '%0A' +
    'Телефон: ' + encodeURIComponent(phone);

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${text}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.ok) {
      status.textContent = 'Спасибо! Заявка отправлена, мы свяжемся с вами в ближайшее время.';
      status.className = 'form-status success';
      form.reset();
    } else {
      throw new Error(data.description || 'Telegram API error');
    }
  } catch (err) {
    status.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам напрямую.';
    status.className = 'form-status error';
  } finally {
    submitBtn.disabled = false;
  }
});
