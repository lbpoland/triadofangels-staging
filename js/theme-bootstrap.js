/* js/theme-bootstrap.js — early theme + motion bootstrap (CSP-safe, no dependencies) */
(() => {
  const KEY = 'toa-theme';
  const VALID = new Set(['toa', 'dark', 'light']);

  let theme = 'toa';
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && VALID.has(saved)) theme = saved;
  } catch { /* ignore */ }

  document.documentElement.dataset.theme = theme;

  try {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) document.documentElement.classList.add('no-reduced-motion');
  } catch { /* ignore */ }
})();
