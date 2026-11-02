// Navigation, project filters, reading progress and footer year. Page content is plain HTML.
(() => {
  const menu = document.getElementById('menu');
  const nav = document.getElementById('navlinks');
  if (menu && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.textContent = open ? '\u00d7' : '\u2630';
    };
    menu.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); menu.focus(); }
    });
  }
  const filters = document.querySelectorAll('.filter');
  filters.forEach((btn) => btn.addEventListener('click', () => {
    filters.forEach((b) => { b.classList.toggle('active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
    document.querySelectorAll('.project-card').forEach((card) => {
      card.hidden = btn.dataset.filter !== 'all' && card.dataset.category !== btn.dataset.filter;
    });
  }));
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  const bar = document.getElementById('progress');
  if (bar) {
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
    };
    addEventListener('scroll', update, { passive: true });
    update();
  }
})();
