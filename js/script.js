document.getElementById('year').textContent = new Date().getFullYear();

const burger = document.getElementById('burger');
const header = document.querySelector('.site-header');
burger.addEventListener('click', () => {
  header.classList.toggle('open');
});
document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => header.classList.remove('open'));
});

const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const phone = form.phone.value.trim();

  if (!name || !phone) {
    status.textContent = 'Пожалуйста, заполните имя и телефон.';
    status.className = 'form-status error';
    return;
  }

  // TODO: подключить отправку данных на сервер/почту/CRM.
  status.textContent = 'Спасибо! Заявка отправлена, мы свяжемся с вами в ближайшее время.';
  status.className = 'form-status success';
  form.reset();
});
