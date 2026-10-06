const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a, .hero-actions a');
const revealItems = document.querySelectorAll('.reveal');
const toast = document.querySelector('.toast');
const toastTrigger = document.querySelector('.toast-trigger');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('open');
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (siteNav && siteNav.classList.contains('open')) {
      siteNav.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

if (toast && toastTrigger) {
  toastTrigger.addEventListener('click', () => {
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 2600);
  });
}
