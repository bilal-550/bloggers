const navToggler = document.getElementById('nav-toggler')
const nav = document.getElementById('nav');
navToggler.addEventListener('click', () => {
  nav.classList.toggle('shown');
})


const anchorButtons = document.querySelectorAll('[data-href]');
anchorButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();

    const href = btn.dataset.href;
    if (href == false || typeof href != 'string') return;

    window.location.assign(href);
  })
})

document.querySelectorAll('.input-clear').forEach(input => input.setAttribute('tabindex', '-1'))