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

/* Hide the floating CTA whenever a matching CTA (or the contact form
   itself) is already on screen, so the same button never doubles up. */
let primaryCtaVisible = false;
const ctaWatchTargets = [
  ...document.querySelectorAll('a.btn-primary[href="#contact"]'),
  document.getElementById('contact')
].filter(Boolean);

let ticking = false;

if ('IntersectionObserver' in window) {
  const visibleCtas = new Set();
  const ctaObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visibleCtas.add(entry.target);
      else visibleCtas.delete(entry.target);
    });
    primaryCtaVisible = visibleCtas.size > 0;
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { threshold: 0.2 });
  ctaWatchTargets.forEach(el => ctaObserver.observe(el));
}

function onScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = progress + '%';

  header.classList.toggle('scrolled', scrollTop > 20);
  floatingCta.classList.toggle('visible', scrollTop > heroHeight() * 0.8 && !primaryCtaVisible);

  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });
onScroll();
setInterval(onScroll, 400);

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

document.querySelectorAll('.gallery-photo img, .doc-photo img').forEach(img => {
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

/* Contact form -> Telegram (via a relay that keeps the bot token secret, see README) */
const TELEGRAM_RELAY_URL = 'https://ridder-house-site-relay.vercel.app/api/telegram';

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

  try {
    const response = await fetch(TELEGRAM_RELAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone })
    });
    const data = await response.json();

    if (response.ok && data.ok) {
      status.textContent = 'Спасибо! Заявка отправлена, мы свяжемся с вами в ближайшее время.';
      status.className = 'form-status success';
      form.reset();
    } else {
      throw new Error(data.error || 'Relay error');
    }
  } catch (err) {
    status.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам напрямую.';
    status.className = 'form-status error';
  } finally {
    submitBtn.disabled = false;
  }
});
