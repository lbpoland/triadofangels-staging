// Enable smooth scrolling only when users have not requested reduced motion.
const prefersReducedMotion = () => {
  try {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

if (!prefersReducedMotion()) {
  document.documentElement.classList.add('no-reduced-motion');
}


// =========================
// THEME SYSTEM (ToA / Dark / Light + automatic High-Contrast support)
// =========================
const THEME_STORAGE_KEY = 'toa-theme';

// Visible themes (menu): toa, dark, light
// Hidden compatibility theme: contrast (kept for forced-colors / prefers-contrast and existing stored values)
const VALID_THEMES = new Set(['toa', 'dark', 'light']);

function getSystemTheme() {
  // Brand-first: default to ToA on first visit. Users can switch and we persist their choice.
  return 'toa';
}

function prefersHighContrast() {
  try {
    return (window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches) ||
           (window.matchMedia && window.matchMedia('(forced-colors: active)').matches);
  } catch {
    return false;
  }
}

function getSavedTheme() {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    // Legacy compatibility: previously stored 'contrast' values should behave like 'dark'.
    if (v === 'contrast') return 'dark';
    return VALID_THEMES.has(v) ? v : null;
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  const t = VALID_THEMES.has(theme) ? theme : 'toa';
  document.documentElement.setAttribute('data-theme', t);
  // Mirror on body for CSS selectors that target body[data-theme].
  try { if (document.body) document.body.setAttribute('data-theme', t); } catch {}
  // Notify UI components (theme menu, etc.).
  try { window.dispatchEvent(new CustomEvent('toa:themechange', { detail: { theme: t } })); } catch {}
  return t;
}

// Apply theme ASAP (best-effort) to reduce flash.
const initialTheme = getSavedTheme() || getSystemTheme();
applyTheme(initialTheme);

document.addEventListener('DOMContentLoaded', function() {

  // Ensure body has the active theme attribute (some pages rely on body selectors).
  try {
    const t = document.documentElement.getAttribute('data-theme') || 'toa';
    document.body.setAttribute('data-theme', t);
  } catch {}

  // Safe closest helper (prevents "closest is not a function" console errors when target is not an Element)
  function closestFromEventTarget(evt, selector) {
    const t = evt && evt.target;
    return (t instanceof Element) ? t.closest(selector) : null;
  }


  
  // =========================
  // A11Y NAME NORMALIZATION (label-content-name-mismatch)
  // =========================
  // Ensures that if an element has visible label text AND an aria-label, the aria-label contains the visible text.
  // This prevents Lighthouse "label-content-name-mismatch" without reducing accessibility quality.
  (function normalizeAriaLabelContentName() {
const isGlyphOnly = (s) => {
  const t = (s || '').replace(/\s+/g, '');
  if (!t) return true;

  return /^[\u00AB\u00BB\u2039\u203A\u2190-\u2193\u25B2-\u25BC\u25C0\u25D0\u25D1\u2630\u2600\u263E\u25CF\u25CB]+$/u.test(t);
};

    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

    const fixNode = (el) => {
      if (!(el instanceof Element)) return;
      if (el.hasAttribute('contenteditable')) return;
      const aria = el.getAttribute('aria-label');
      if (!aria) return;
      const visible = norm(el.textContent || '');
      if (!visible) return;
      if (isGlyphOnly(visible)) return;

      const a = norm(aria);
      const v = visible.toLowerCase();
      if (a.toLowerCase().includes(v)) return;

      // Preserve original aria context while ensuring visible label is contained
      const next = `${visible} — ${a}`.slice(0, 160);
      el.setAttribute('aria-label', next);
    };

    const scan = (root = document) => {
      root.querySelectorAll('[aria-label]').forEach(fixNode);
    };

    // Initial scan
    try { scan(document); } catch {}

    // Observe future DOM inserts (album/track/music pages generate content dynamically)
    let scheduled = false;
    const scheduleScan = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        try { scan(document); } catch {}
      });
    };

    try {
      const mo = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.addedNodes && m.addedNodes.length) {
            scheduleScan();
            break;
          }
        }
      });
      mo.observe(document.documentElement, { subtree: true, childList: true });
    } catch {}
  })();

// =========================
  // THEME MENU UI
  // =========================
  (function setupThemeMenu() {
    const toggle = document.getElementById('theme-toggle');
    const menu = document.getElementById('theme-menu');
    if (!toggle || !menu) return;

    const items = Array.from(menu.querySelectorAll('[data-theme]'));
    if (!items.length) return;

    function currentTheme() {
      const htmlT = document.documentElement.getAttribute('data-theme');
      const bodyT = (document.body && document.body.getAttribute('data-theme')) || null;
      // Read-only: NEVER write attributes here (this function is called from observers/listeners).
      // Writing attributes inside a MutationObserver callback can cause recursive mutation loops
      // and freeze the browser (what you experienced in Firefox).
      const t = (VALID_THEMES.has(htmlT) ? htmlT : (VALID_THEMES.has(bodyT) ? bodyT : 'toa'));
      return t;
    }

    function syncMenu() {
      const t = currentTheme();
      items.forEach(btn => {
        const isActive = btn.getAttribute('data-theme') === t;
        btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
    }

    // Keep menu state accurate even if theme changes outside this menu (e.g., stored value applied on load).
    try {
      let _themeSyncRaf = 0;
      window.addEventListener('toa:themechange', () => {
        if (_themeSyncRaf) return;
        _themeSyncRaf = requestAnimationFrame(() => { _themeSyncRaf = 0; syncMenu(); });
      });
      const obs = new MutationObserver(() => {
        if (_themeSyncRaf) return;
        _themeSyncRaf = requestAnimationFrame(() => { _themeSyncRaf = 0; syncMenu(); });
      });
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    } catch {}

    function openMenu() {
      menu.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      syncMenu();
      // focus active item
      const t = currentTheme();
      const active = items.find(btn => btn.getAttribute('data-theme') === t) || items[0];
      active.focus({ preventScroll: true });
    }

    function closeMenu({ restoreFocus = true } = {}) {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      if (restoreFocus) toggle.focus({ preventScroll: true });
    }

    function isOpen() {
      return !menu.hidden;
    }

    function setThemeAndClose(theme) {
      const applied = applyTheme(theme);
      try { localStorage.setItem(THEME_STORAGE_KEY, applied); } catch {}
      syncMenu();
      closeMenu();
    }

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (isOpen()) closeMenu({ restoreFocus: false });
      else openMenu();
    });

    items.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const theme = btn.getAttribute('data-theme');
        setThemeAndClose(theme);
      });

      btn.addEventListener('keydown', (e) => {
        const key = e.key;
        if (key === 'ArrowDown' || key === 'ArrowUp') {
          e.preventDefault();
          const dir = key === 'ArrowDown' ? 1 : -1;
          const i = items.indexOf(btn);
          const next = items[(i + dir + items.length) % items.length];
          next.focus({ preventScroll: true });
        }
        if (key === 'Home') {
          e.preventDefault();
          items[0].focus({ preventScroll: true });
        }
        if (key === 'End') {
          e.preventDefault();
          items[items.length - 1].focus({ preventScroll: true });
        }
        if (key === 'Escape') {
          e.preventDefault();
          closeMenu();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        e.preventDefault();
        closeMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (!isOpen()) return;
      const target = e.target;
      if (target instanceof Node && (menu.contains(target) || toggle.contains(target))) return;
      closeMenu({ restoreFocus: false });
    });

    // close menu if focus leaves to elsewhere
    document.addEventListener('focusin', (e) => {
      if (!isOpen()) return;
      const target = e.target;
      if (target instanceof Node && (menu.contains(target) || toggle.contains(target))) return;
      closeMenu({ restoreFocus: false });
    });

    // initialize
    syncMenu();
    closeMenu({ restoreFocus: false });
  })();


  // =========================
  // UNIVERSAL ALBUM CATEGORY FILTER
  // =========================
  function setupAlbumCategoryFilter(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const albumGrid = section.querySelector('.album-grid');
    if (!albumGrid) return;
    const albumBlocks = albumGrid.querySelectorAll('.album-block');
    const categoryButtons = section.querySelectorAll('.category-button');
    const categoryOptions = section.querySelectorAll('.category-option');

    function handleFilter(e, category) {
      if (e) e.preventDefault();
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      categoryOptions.forEach(opt => opt.classList.remove('active'));
      const clicked = e && (closestFromEventTarget(e, '.category-button') || closestFromEventTarget(e, '.category-option'));
      if (clicked) clicked.classList.add('active');
      albumBlocks.forEach(album => {
        const albumCategories = (album.getAttribute('data-category') || '').split(' ');
        if (category === 'all' || albumCategories.includes(category)) {
          album.classList.remove('hidden');
        } else {
          album.classList.add('hidden');
        }
      });
      // Dropdown menu closes after select
      if (e && closestFromEventTarget(e, '.streaming-dropdown-menu')) {
        const menu = closestFromEventTarget(e, '.streaming-dropdown-menu');
        menu.classList.remove('open');
        const dropdownButton = menu.previousElementSibling;
        if (dropdownButton) dropdownButton.setAttribute('aria-expanded', 'false');
      }
    }

    // Desktop & touch support for category buttons
    categoryButtons.forEach(button => {
      button.addEventListener('click', e => handleFilter(e, button.getAttribute('data-category')));
      button.addEventListener('touchstart', e => {
        e.preventDefault();
        handleFilter(e, button.getAttribute('data-category'));
      }, { passive: false });
    });
    // Same for dropdown options
    categoryOptions.forEach(option => {
      option.addEventListener('click', e => handleFilter(e, option.getAttribute('data-category')));
      option.addEventListener('touchstart', e => {
        e.preventDefault();
        handleFilter(e, option.getAttribute('data-category'));
      }, { passive: false });
    });

    // Default state: show all, highlight first button
    if (categoryButtons.length > 0) {
      categoryButtons[0].classList.add('active');
      handleFilter(null, 'all');
    }
  }
  // Initialize album category filters (add more as needed)
  setupAlbumCategoryFilter('toa-studios-albums');
  setupAlbumCategoryFilter('triad-albums');
  // setupAlbumCategoryFilter('your-other-album-section');

  // =========================
  // MOBILE MENU (Nav Drawer)
  // =========================
  (function(){
    const toggleButton = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('main-nav');
    if (!toggleButton || !navMenu) return;

    // Toggle menu open/close
    toggleButton.addEventListener('click', () => {
      const isExpanded = navMenu.classList.toggle('show');
      toggleButton.setAttribute('aria-expanded', isExpanded);
      document.body.classList.toggle('nav-open', isExpanded);
      if (!isExpanded && typeof navMenu.__toaCloseSubmenus === 'function') navMenu.__toaCloseSubmenus();
    });

    // Click outside to close menu
    const navShell = navMenu.closest('.nav-shell') || navMenu.parentElement;
    document.addEventListener('click', (e) => {
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (!navMenu.classList.contains('show')) return;

      const inside = navShell ? navShell.contains(t) : (navMenu.contains(t) || toggleButton.contains(t));
      if (inside) return;

      navMenu.classList.remove('show');
      toggleButton.setAttribute('aria-expanded', false);
      document.body.classList.remove('nav-open');
      if (typeof navMenu.__toaCloseSubmenus === 'function') navMenu.__toaCloseSubmenus();
    });

    // ESC key closes menu for accessibility
    document.addEventListener('keyup', function(e) {
      if (e.key === "Escape" && navMenu.classList.contains('show')) {
        navMenu.classList.remove('show');
        toggleButton.setAttribute('aria-expanded', false);
        document.body.classList.remove('nav-open');
        if (typeof navMenu.__toaCloseSubmenus === 'function') navMenu.__toaCloseSubmenus();
        toggleButton.focus();
      }
    });
  })();


  // =========================
  // NAV SUBMENUS (Dropdowns) + ARIA-CURRENT AUTO
  // =========================
  (function setupNavSubmenusAndCurrent() {
    const navMenu = document.getElementById('main-nav');
    if (!navMenu) return;

    // Stream submenu is redundant (all items land on the same streaming page).
    // Remove it before wiring submenu toggles to avoid pointless UI and stale references.
    try {
      const streamLink = navMenu.querySelector('a[href="/streaming.html"]');
      const streamItem = streamLink ? streamLink.closest('li.nav-item.nav-has-sub') : null;
      if (streamItem) {
        const toggle = streamItem.querySelector('.nav-sub-toggle');
        const submenu = streamItem.querySelector('.nav-submenu');
        if (toggle) toggle.remove();
        if (submenu) submenu.remove();
        streamItem.classList.remove('nav-has-sub');
      }
    } catch {}

    const toggles = Array.from(navMenu.querySelectorAll('.nav-sub-toggle[aria-controls]'));
    const menus = toggles
      .map((btn) => {
        const id = btn.getAttribute('aria-controls');
        const menu = id ? document.getElementById(id) : null;
        return { btn, menu };
      })
      .filter((x) => x.menu);

    function closeAllSubmenus({ keepButton = null } = {}) {
      closeSubPanel(false);
      for (const { btn, menu } of menus) {
        if (keepButton && btn === keepButton) continue;
        btn.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
        /* CSP-safe: no inline style mutations */
      }
    }

    // Expose to other modules (mobile menu close, etc.) without global pollution.
    navMenu.__toaCloseSubmenus = closeAllSubmenus;

    const isMobileNav = () => {
      try { return window.matchMedia && window.matchMedia('(max-width: 860px)').matches; } catch { return false; }
    };

    // Second-panel submenu (Option B) — created once, reused.
    const navShell = navMenu.closest('.nav-shell') || navMenu.parentElement;
    let subPanel = navShell ? navShell.querySelector('.nav-subpanel') : null;
    let subPanelTitle = null;
    let subPanelList = null;
    let subPanelBack = null;

    const ensureSubPanel = () => {
      if (!navShell) return null;
      if (subPanel) return subPanel;

      subPanel = document.createElement('div');
      subPanel.className = 'nav-subpanel';
      subPanel.hidden = true;

      const header = document.createElement('div');
      header.className = 'nav-subpanel__header';

      subPanelBack = document.createElement('button');
      subPanelBack.type = 'button';
      subPanelBack.className = 'nav-subpanel__back';
      subPanelBack.textContent = 'Back';

      subPanelTitle = document.createElement('p');
      subPanelTitle.className = 'nav-subpanel__title';
      subPanelTitle.textContent = '';

      header.appendChild(subPanelBack);
      header.appendChild(subPanelTitle);

      subPanelList = document.createElement('ul');
      subPanelList.className = 'nav-subpanel__list';
      subPanelList.setAttribute('role', 'list');

      subPanel.appendChild(header);
      subPanel.appendChild(subPanelList);
      navShell.appendChild(subPanel);

      subPanelBack.addEventListener('click', (e) => {
        e.preventDefault();
        closeSubPanel(true);
      });

      subPanel.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeSubPanel(true);
        }
      });

      return subPanel;
    };

    const openSubPanel = (btn, menu) => {
      const panel = ensureSubPanel();
      if (!panel || !subPanelList) return;

      // Clear any previous items.
      subPanelList.replaceChildren();

      const parentItem = btn.closest('li');
      const parentLink = parentItem ? parentItem.querySelector('a') : null;
      const title = parentLink ? (parentLink.textContent || '').trim() : 'Menu';
      if (subPanelTitle) subPanelTitle.textContent = title || 'Menu';

      // Clone submenu links into the panel.
      const links = Array.from(menu.querySelectorAll('a'));
      for (const a of links) {
        const li = document.createElement('li');
        const clone = a.cloneNode(true);
        // Remove aria-label if it mismatches visible text; global normalizer will also handle.
        if (clone.hasAttribute('aria-label')) clone.removeAttribute('aria-label');
        li.appendChild(clone);
        subPanelList.appendChild(li);
      }

      // Open panel.
      navShell.classList.add('nav-subpanel-open');
      panel.hidden = false;
      panel.__toaReturnBtn = btn;

      // Keep expanded state in sync.
      btn.setAttribute('aria-expanded', 'true');
      menu.hidden = true;

      const first = subPanelList.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
      if (first) first.focus({ preventScroll: true });
    };

    const closeSubPanel = (restoreFocus) => {
      if (!subPanel || !navShell) return;
      if (subPanel.hidden) return;

      navShell.classList.remove('nav-subpanel-open');
      subPanel.hidden = true;

      const returnBtn = subPanel.__toaReturnBtn;
      if (returnBtn) {
        returnBtn.setAttribute('aria-expanded', 'false');
        if (restoreFocus) returnBtn.focus({ preventScroll: true });
      }
      subPanel.__toaReturnBtn = null;
    };

function openSubmenu(btn, menu) {
      if (isMobileNav()) {
        // Mobile uses a dedicated second-panel view (Option B)
        openSubPanel(btn, menu);
        return;
      }
      closeAllSubmenus({ keepButton: btn });
      btn.setAttribute('aria-expanded', 'true');
      menu.hidden = false;
    }

    function toggleSubmenu(btn, menu) {
      // On mobile, the button toggles the dedicated subpanel.
      if (isMobileNav()) {
        if (subPanel && !subPanel.hidden) {
          closeSubPanel(true);
          return;
        }
        openSubPanel(btn, menu);
        return;
      }

      const open = btn.getAttribute('aria-expanded') === 'true' && menu.hidden === false;
      if (open) {
        btn.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
        return;
      }
      openSubmenu(btn, menu);
    }

    // Click toggles
    for (const { btn, menu } of menus) {
      // Ensure hidden by default
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSubmenu(btn, menu);
      });

      // Keyboard: ArrowDown opens and focuses first item; Escape closes
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          openSubmenu(btn, menu);
          const first = menu.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
          if (first) first.focus({ preventScroll: true });
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          closeAllSubmenus();
          btn.focus({ preventScroll: true });
        }
      });

      // Close when menu loses focus to outside (but allow focus within menu)
      menu.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeAllSubmenus();
          btn.focus({ preventScroll: true });
        }
      });
    }

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (navMenu.contains(t)) return;
      closeAllSubmenus();
    });

    // Also close when focus leaves the nav entirely
    document.addEventListener('focusin', (e) => {
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (navMenu.contains(t)) return;
      closeAllSubmenus({ });
    });
    // -------- aria-current auto (smart section mapping) --------
    const normalizePath = (p) => {
      let s = String(p || '/');
      s = s.split('?')[0].split('#')[0];
      if (s === '/index.html') s = '/';
      // Keep trailing slash on folders, but normalize duplicate
      s = s.replace(/\/{2,}/g, '/');
      return s;
    };

    const here = normalizePath(window.location.pathname);

    // Clear existing aria-current
    navMenu.querySelectorAll('a[aria-current]').forEach((a) => a.removeAttribute('aria-current'));

    const setCurrentForHref = (href) => {
      navMenu.querySelectorAll(`a[href="${href}"]`).forEach((a) => a.setAttribute('aria-current', 'page'));
    };

    // Top-level exact matches
    setCurrentForHref(here);

    // Section mapping (single-highlight: one aria-current at a time)
    if (here === '/index.html' || here === '/') setCurrentForHref('/index.html');

    if (here.startsWith('/lyrics/')) {
      setCurrentForHref('/lyrics/');
      return;
    }

    if (here.startsWith('/music/') || here === '/music.html' || here === '/album.html' || here === '/track.html') {
      setCurrentForHref('/music.html');
      return;
    }

    if (here === '/streaming.html') {
      setCurrentForHref('/streaming.html');
      return;
    }

    if (here.startsWith('/publishing/') || here === '/publishing.html' || here === '/book.html') {
      setCurrentForHref('/publishing.html');
      return;
    }

    if (here.startsWith('/search/')) { setCurrentForHref('/search/'); return; }

    // Top-level pages
    if (here === '/about.html') { setCurrentForHref('/about.html'); return; }
    if (here === '/games.html') { setCurrentForHref('/games.html'); return; }
    if (here === '/apps.html') { setCurrentForHref('/apps.html'); return; }
    if (here === '/merch.html') { setCurrentForHref('/merch.html'); return; }
    if (here === '/digital-store.html') { setCurrentForHref('/digital-store.html'); return; }
    if (here === '/contact.html') { setCurrentForHref('/contact.html'); return; }
    if (here === '/privacy.html') { setCurrentForHref('/privacy.html'); return; }
    if (here === '/terms.html') { setCurrentForHref('/terms.html'); return; }
  })();

  // =========================
  // BACK TO TOP (site-wide, injected)
  // =========================
  (function setupBackToTop() {
    const btnId = 'toa-back-to-top';
    if (document.getElementById(btnId)) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = btnId;
    btn.className = 'to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.hidden = true;

    const icon = document.createElement('span');
    icon.className = 'to-top__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '↑';

    const label = document.createElement('span');
    label.className = 'sr-only';
    label.textContent = 'Back to top';

    btn.appendChild(icon);
    btn.appendChild(label);

    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
      try {
        const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: prefersReduce ? 'auto' : 'smooth' });
      } catch {
        window.scrollTo(0, 0);
      }
    });

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        const show = window.scrollY > 700;
        btn.hidden = !show;
        btn.classList.toggle('to-top--show', show);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  // =========================
  // STREAMING DROPDOWN (Touch & Mouse)
  // =========================
  (function(){
    let isDropdownScrolling = false;
    let dropdownTouchedMenu = null;
    document.querySelectorAll('.streaming-dropdown-menu').forEach(menu => {
      menu.addEventListener('touchstart', function() {
        dropdownTouchedMenu = this;
        isDropdownScrolling = false;
      }, { passive: true });
      menu.addEventListener('touchmove', function() {
        if (dropdownTouchedMenu === this) isDropdownScrolling = true;
      }, { passive: true });
      menu.addEventListener('touchend', function() {
        setTimeout(() => {
          isDropdownScrolling = false;
          dropdownTouchedMenu = null;
        }, 50);
      });
    });

    // Dropdown open/close toggle
    document.querySelectorAll('.streaming-dropdown-button').forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.streaming-dropdown-menu.open').forEach(menu => {
          if (menu !== button.nextElementSibling) {
            menu.classList.remove('open');
            if (menu.previousElementSibling) menu.previousElementSibling.setAttribute('aria-expanded', 'false');
          }
        });
        const menu = button.nextElementSibling;
        if (menu && menu.classList.contains('streaming-dropdown-menu')) {
          const isOpen = menu.classList.toggle('open');
          button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
      });
      button.addEventListener('touchstart', function(e) {
        e.preventDefault();
        button.click();
      }, { passive: false });
    });

    // Close dropdown if not scrolling and not clicking/touching inside
    function closeAllDropdowns(e) {
      if (isDropdownScrolling) return;
      if (
        !closestFromEventTarget(e, '.streaming-dropdown-menu') &&
        !closestFromEventTarget(e, '.streaming-dropdown-button')
      ) {
        document.querySelectorAll('.streaming-dropdown-menu.open').forEach(menu => {
          menu.classList.remove('open');
          if (menu.previousElementSibling) menu.previousElementSibling.setAttribute('aria-expanded', 'false');
        });
      }
    }
    document.addEventListener('mousedown', closeAllDropdowns);
    document.addEventListener('touchstart', closeAllDropdowns, { passive: false });
  })();

  // =========================
  // UNIVERSAL CAROUSEL/SLIDER NAVIGATION (Albums, Music Videos, Home Videos)
  // =========================
  function setupCarouselNav(config) {
    // config:
    // {
    //   buttonSelector, itemSelector,
    //   leftClass, rightClass,
    //   carouselFocusableSelector // optional selector to apply keyboard nav
    // }
    const buttons = Array.from(document.querySelectorAll(config.buttonSelector));
    if (!buttons.length) return;

    const byCarousel = new Map();

    function getCarousel(id) {
      if (!id) return null;
      return document.getElementById(id);
    }

    function getScrollAmount(carousel) {
      const item = carousel.querySelector(config.itemSelector);
      if (!item) return 0;
      const cs = window.getComputedStyle(carousel);
      const gap = parseFloat(cs.columnGap || cs.gap || '0') || 0;
      return item.getBoundingClientRect().width + gap;
    }

    function updateButtonStates(id) {
      const entry = byCarousel.get(id);
      if (!entry) return;
      const { carousel, leftButtons, rightButtons } = entry;

      const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
      const atStart = carousel.scrollLeft <= 1;
      const atEnd = carousel.scrollLeft >= (maxScrollLeft - 1);

      leftButtons.forEach(b => { b.disabled = atStart; b.setAttribute('aria-disabled', String(atStart)); });
      rightButtons.forEach(b => { b.disabled = atEnd; b.setAttribute('aria-disabled', String(atEnd)); });
    }

    function scheduleUpdate(id) {
      const entry = byCarousel.get(id);
      if (!entry) return;
      if (entry.raf) cancelAnimationFrame(entry.raf);
      entry.raf = requestAnimationFrame(() => updateButtonStates(id));
    }

    function registerButton(button) {
      const id = button.getAttribute('data-carousel');
      const carousel = getCarousel(id);
      if (!carousel) return;

      let entry = byCarousel.get(id);
      if (!entry) {
        entry = {
          id,
          carousel,
          raf: 0,
          leftButtons: [],
          rightButtons: [],
          ro: null
        };
        byCarousel.set(id, entry);

        carousel.addEventListener('scroll', () => scheduleUpdate(id), { passive: true });
        // Resize observer keeps boundary states correct on responsive changes
        if ('ResizeObserver' in window) {
          entry.ro = new ResizeObserver(() => scheduleUpdate(id));
          entry.ro.observe(carousel);
        } else {
          window.addEventListener('resize', () => scheduleUpdate(id), { passive: true });
        }

        // Keyboard navigation on the carousel itself
        const focusable = carousel.matches(config.carouselFocusableSelector || '*') ? carousel : null;
        if (focusable) {
          if (!focusable.hasAttribute('tabindex')) focusable.setAttribute('tabindex', '0');
          focusable.addEventListener('keydown', (e) => {
            const key = e.key;
            if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Home' && key !== 'End') return;
            if (prefersReducedMotion()) return;

            const amount = getScrollAmount(carousel) || 320;
            if (key === 'ArrowLeft') carousel.scrollBy({ left: -amount, behavior: 'smooth' });
            if (key === 'ArrowRight') carousel.scrollBy({ left: amount, behavior: 'smooth' });
            if (key === 'Home') carousel.scrollTo({ left: 0, behavior: 'smooth' });
            if (key === 'End') carousel.scrollTo({ left: carousel.scrollWidth, behavior: 'smooth' });
            e.preventDefault();
          });
        }
      }

      const isLeft = button.classList.contains(config.leftClass);
      const isRight = button.classList.contains(config.rightClass);
      if (isLeft) entry.leftButtons.push(button);
      if (isRight) entry.rightButtons.push(button);

      function scrollCarousel() {
        const amount = getScrollAmount(carousel);
        if (!amount) return;
        const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
        if (isLeft) carousel.scrollBy({ left: -amount, behavior });
        if (isRight) carousel.scrollBy({ left: amount, behavior });
      }

      button.addEventListener('click', scrollCarousel);
      button.addEventListener('touchstart', (e) => {
        // Avoid double-activation on mobile; keep explicit intent.
        e.preventDefault();
        scrollCarousel();
      }, { passive: false });

      // Initial state
      scheduleUpdate(id);
    }

    buttons.forEach(registerButton);
  }

  // Album carousels (horizontal scroll)
  setupCarouselNav({
    buttonSelector: '.album-nav-button',
    itemSelector: '.album-block',
    leftClass: 'album-nav-left',
    rightClass: 'album-nav-right',
    carouselFocusableSelector: '.album-track, .album-carousel'
  });

  // Music video carousels
  setupCarouselNav({
    buttonSelector: '.music-video-nav-button',
    itemSelector: '.music-video-item',
    leftClass: 'music-video-nav-left',
    rightClass: 'music-video-nav-right',
    carouselFocusableSelector: '.music-video-carousel'
  });

  // Home page/index video carousels
  setupCarouselNav({
    buttonSelector: '.index-video-nav-button',
    itemSelector: '.index-video-item',
    leftClass: 'index-video-nav-left',
    rightClass: 'index-video-nav-right',
    carouselFocusableSelector: '.index-video-carousel'
  });

});


// Footer year
(function toaSetFooterYear(){
  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();

// =========================
// ACCESSIBILITY NORMALIZATION (P0)
// - Fix label-content-name mismatch by removing mismatched aria-label where visible text exists.
// - Convert inline glyph icons into generated content (CSP-safe; no inline style attr).
// =========================
(function toaAccessibilityNormalization(){
  const getVisibleText = (el) => {
    try {
      const clone = el.cloneNode(true);
      clone.querySelectorAll('.sr-only,[aria-hidden="true"]').forEach((n) => n.remove());
      const txt = (clone.textContent || '').replace(/\s+/g, ' ').trim();
      if (!txt) return '';
      // Ignore pure glyph/punctuation
      if (!/[a-z0-9]/i.test(txt)) return '';
      return txt;
    } catch {
      return '';
    }
  };

  // Fix aria-label mismatches on text-labeled elements.
  document.querySelectorAll('[aria-label]').forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const aria = el.getAttribute('aria-label');
    if (!aria) return;

    const visible = getVisibleText(el);
    if (!visible) return;

    const a = aria.trim().toLowerCase();
    const v = visible.trim().toLowerCase();
    if (a.includes(v)) return;

    // Prefer removing aria-label so the visible text becomes the accessible name.
    if (el.matches('a, button')) {
      el.removeAttribute('aria-label');
    } else {
      el.setAttribute('aria-label', visible);
    }
  });

  // Convert inline glyphs (◐ ☰ ▾ etc) into generated content for visual-only spans.
  const glyphSpans = document.querySelectorAll('.theme-icon, .menu-icon, .nav-sub-toggle span[aria-hidden="true"]');
  glyphSpans.forEach((span) => {
    if (!(span instanceof HTMLElement)) return;
    const t = (span.textContent || '').trim();
    if (!t) return;
    // Keep it strictly short; avoids capturing unexpected text.
    if (t.length > 2) return;
    span.classList.add('toa-glyph');
    span.setAttribute('data-glyph', t);
    span.textContent = '';
  });
})();


// =========================
// HOME — Featured Albums Rail Enhancer (P0)
// Touch scroll is native. Add keyboard support + tabindex for accessibility.
// =========================
(function toaEnhanceHomeFeaturedRail(){
  const rail = document.querySelector('.featured-albums-carousel .album-track');
  if (!rail) return;

  if (!rail.hasAttribute('tabindex')) rail.setAttribute('tabindex', '0');
  if (!rail.hasAttribute('role')) rail.setAttribute('role', 'region');

  const stepFor = () => {
    const card = rail.querySelector('.album-block');
    if (!card) return 260;
    const r = card.getBoundingClientRect();
    return Math.max(220, Math.round(r.width + 14));
  };

  rail.addEventListener('keydown', (e) => {
    const step = stepFor();
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      rail.scrollBy({ left: step, top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      rail.scrollBy({ left: -step, top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
    if (e.key === 'Home') {
      e.preventDefault();
      rail.scrollTo({ left: 0, top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
    if (e.key === 'End') {
      e.preventDefault();
      rail.scrollTo({ left: rail.scrollWidth, top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
  }, { passive: false });
})();
