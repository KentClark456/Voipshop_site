// docs/scripts/site.js — compatibility layer for new partial nav + legacy fallback (with mobile menu & force flag)
(function () {
  // ---------- Shared helpers ----------
  function safeParse(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
  }

  function getCartCount() {
    const custom   = safeParse('voip:customBuild') || [];
    const selected = safeParse('voip:selectedPackage') || {};
    if (Array.isArray(custom) && custom.length > 0) {
      return custom.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
    }
    if (Array.isArray(selected.devices)) {
      return selected.devices.reduce((sum, d) => sum + (Number(d.number) || 0), 0);
    }
    return 0;
  }

  function updateAllCartBadges() {
    const n = getCartCount();

    // New partial badges: <span data-cart-count>
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      if (n > 0) {
        el.textContent = n;
        el.setAttribute('data-show', 'true');
        el.hidden = false;
      } else {
        el.textContent = '';
        el.removeAttribute('data-show');
        el.hidden = true;
      }
    });

    // Legacy single badge: #cart-count
    const legacy = document.getElementById('cart-count');
    if (legacy) {
      if (n > 0) { legacy.textContent = n; legacy.hidden = false; }
      else { legacy.textContent = ''; legacy.hidden = true; }
    }
  }

  document.addEventListener('DOMContentLoaded', updateAllCartBadges);
  window.addEventListener('storage', (e) => {
    if (['voip:customBuild','voip:selectedPackage'].includes(e.key)) updateAllCartBadges();
  });

  // ---------- Decide: new partial present? ----------
  document.addEventListener('DOMContentLoaded', () => {
    // Set window.NAV_FORCE_LEGACY = true before this script loads if you want to force the legacy header.
    const forceLegacy = window.NAV_FORCE_LEGACY === true;

    if (!forceLegacy) {
      const hasNewPartial =
        document.getElementById('mobile-nav') ||   // off-canvas container from new partial
        document.getElementById('menu-toggle');    // hamburger button from new partial

      if (hasNewPartial) {
        console.log('[nav] New partial detected — skipping legacy injection.');
        return; // Let the new partial handle everything (including its own JS/CSS)
      }
    } else {
      console.log('[nav] Force legacy flag is ON — injecting legacy header.');
    }

    // ---------- Legacy nav injection ----------

    // Optional Tailwind safelist (harmless if Tailwind not used). We only load the CDN if it isn't already present.
    const TW_SAFELIST = [
      'hidden','block','md:hidden','md:flex','overflow-hidden',
      'bg-white/90','border-b','border-gray-200','sticky','top-0','z-50','backdrop-blur',
      'max-w-screen-xl','mx-auto','px-4','md:px-6','py-3',
      'flex','items-center','justify-between','gap-6',
      'text-sm','font-medium','tracking-tight','text-gray-700','hover:text-black',
      'space-y-2','text-base'
    ];

    function ensureTailwind() {
      return new Promise((resolve, reject) => {
        if (document.querySelector('script[src*="cdn.tailwindcss.com"]')) return resolve();
        // Provide a tiny config so any JS-toggled classes won't be purged.
        window.tailwind = window.tailwind || {};
        window.tailwind.config = window.tailwind.config || {};
        window.tailwind.config.safelist = Array.from(new Set([...(window.tailwind.config.safelist || []), ...TW_SAFELIST]));
        const s = document.createElement('script');
        s.src = 'https://cdn.tailwindcss.com';
        s.async = true; s.defer = true;
        s.onload = resolve;
        s.onerror = () => reject(new Error('Failed to load Tailwind CDN'));
        document.head.appendChild(s);
      });
    }

    function ensureNavSlot() {
      let slot = document.getElementById('nav-slot');
      if (!slot) {
        slot = document.createElement('div');
        slot.id = 'nav-slot';
        document.body.insertBefore(slot, document.body.firstChild);
      }
      return slot;
    }

    function removeLegacyNav() {
      // Remove any old headers your older templates may have rendered
      document.querySelectorAll('header.site-navbar, header[data-legacy-nav], header[role="banner"]')
        .forEach(el => el.remove());
    }

    // Header-only CSS (scoped to #nav-slot > header so it can’t move your page titles)
    function injectNavCSS() {
      if (document.querySelector('style[data-nav-style]')) return;
      const css = `
        #nav-slot { display:block; }
        #nav-slot > header{
          width:100vw; margin-left:calc(50% - 50vw); margin-right:calc(50% - 50vw);
          position:sticky; top:0; z-index:50;
          background:rgba(255,255,255,.9);
          backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
          border-bottom:1px solid #e5e7eb; text-align:initial;
        }
        /* LIMIT scope strictly to the injected header */
        #nav-slot > header, #nav-slot > header * { box-sizing:border-box; }
        #nav-slot > header .row{
          width:100%; margin:0;
          padding:12px 16px 12px 12px;
          display:flex; align-items:center; justify-content:space-between; gap:24px;
        }
        #nav-slot > header nav { display:none; margin-left:auto; align-items:center; gap:24px; }
        #nav-slot > header a { color:#374151; text-decoration:none; font:500 14px/1.2 system-ui; }
        #nav-slot > header a:hover { color:#000; }
        #nav-slot > header nav a[aria-current="page"] { color:#000; }
        #nav-slot > header svg { display:block; }

        /* Desktop ≥900px: show desktop nav, HIDE burger & mobile panel */
        @media (min-width:900px){
          #nav-slot > header nav[data-desktop="true"]{ display:inline-flex; }
          #nav-slot > header button[data-toggle="mobile"]{ display:none !important; } /* <— important to beat inline */
          #nav-slot > header #mobileMenu{ display:none !important; }
        }
        /* Mobile <900px: hide desktop nav, show burger */
        @media (max-width:899.98px){
          #nav-slot > header nav[data-desktop="true"]{ display:none; }
          #nav-slot > header button[data-toggle="mobile"]{ display:inline-flex; }
        }

        /* Mobile panel default hidden; JS toggles [hidden] attribute */
        #nav-slot > header #mobileMenu[hidden] { display:none !important; }
        #nav-slot > header #mobileMenu{
          background:#fff; border-top:1px solid #e5e7eb;
        }
        #nav-slot > header #mobileMenu ul{
          list-style:none; margin:0; padding:12px 16px;
        }
        #nav-slot > header #mobileMenu a{
          display:block; padding:10px 4px; color:#111827; text-decoration:none;
          font:500 16px/1.2 system-ui;
        }
        #nav-slot > header #mobileMenu a:hover{ color:#000; }
      `;
      const style = document.createElement('style');
      style.setAttribute('data-nav-style', '1');
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
    }

    const NAV_HTML = `
<header>
  <div class="row">
    <!-- Brand -->
    <a href="index.html" aria-label="VoIP Shop — Home" style="display:inline-flex;align-items:center;gap:12px;text-decoration:none;margin-left:12px">
      <img src="Assets/Group 1642logo (1).png" alt="VoIP Shop Logo" style="height:32px;width:auto;object-fit:contain;display:block">
    </a>

    <!-- Desktop nav -->
    <nav data-desktop="true" aria-label="Primary">
      <a href="packages.html">Packages</a>
      <a href="build-solution.html">Custom Build</a>
      <a href="voice-services.html">Voice Services</a>
      <a href="mobile-app.html">Mobile App</a>
      <a href="contact.html">Contact Us</a>

      <a href="checkout.html" title="Cart" style="position:relative;display:inline-flex;align-items:center;color:#0B63E6;margin-left:6px">
        <svg viewBox="0 0 24 24" aria-hidden="true" style="height:20px;width:20px">
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 7h13l-1.5-7M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span id="cart-count" hidden
              style="position:absolute;top:-6px;right:-8px;background:#0B63E6;color:#fff;font:700 10px/1 system-ui;padding:2px 6px;border-radius:999px"></span>
      </a>
      <a href="login.html" title="Account" aria-label="Account" style="display:inline-flex;align-items:center;color:#374151;text-decoration:none">
        <svg viewBox="0 0 24 24" aria-hidden="true" style="height:20px;width:20px">
          <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2"/>
          <path d="M5.5 21a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </a>
    </nav>

    <!-- Mobile hamburger -->
    <button data-toggle="mobile"
            id="navToggle"
            aria-label="Toggle menu"
            aria-controls="mobileMenu"
            aria-expanded="false"
            style="margin-left:auto;display:inline-flex;align-items:center;justify-content:center;height:40px;width:44px;border:1px solid #e5e7eb;border-radius:12px;background:#fff">
      <svg xmlns="http://www.w3.org/2000/svg" style="height:24px;width:24px" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>
  </div>

  <!-- Mobile panel -->
  <div id="mobileMenu" hidden>
    <ul>
      <li><a href="packages.html">Packages</a></li>
      <li><a href="build-solution.html">Custom Build</a></li>
      <li><a href="voice-services.html">Voice Services</a></li>
      <li><a href="mobile-app.html">Mobile App</a></li>
      <li><a href="contact.html">Contact Us</a></li>
      <li><a href="checkout.html">Cart</a></li>
      <li><a href="login.html">Account</a></li>
    </ul>
  </div>
</header>`.trim();

    function highlightActive(root) {
      const current = location.pathname.replace(/index\.html$/, '').replace(/\/+$/, '');
      root.querySelectorAll('nav a[href], #mobileMenu a[href]').forEach(a => {
        const href = new URL(a.getAttribute('href'), location.href)
          .pathname.replace(/index\.html$/, '').replace(/\/+$/, '');
        if (href === current) a.setAttribute('aria-current', 'page');
      });
    }

    function wireMobileToggle(root) {
      const btn  = root.querySelector('#navToggle');
      const menu = root.querySelector('#mobileMenu');
      if (!btn || !menu) return;

      // Use inline overflow lock (works without Tailwind)
      let prevOverflow = '';
      function setOpen(open) {
        btn.setAttribute('aria-expanded', String(open));
        if (open) {
          menu.removeAttribute('hidden');
          prevOverflow = document.documentElement.style.overflow;
          document.documentElement.style.overflow = 'hidden';
        } else {
          menu.setAttribute('hidden', '');
          document.documentElement.style.overflow = prevOverflow || '';
        }
      }

      btn.addEventListener('click', () => setOpen(menu.hasAttribute('hidden')));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
      menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });

      // Close menu if we resize up to desktop while open
      let lastW = window.innerWidth;
      window.addEventListener('resize', () => {
        const w = window.innerWidth;
        if (w !== lastW && w >= 900) setOpen(false);
        lastW = w;
      });
    }

    // Inject
    ensureTailwind().finally(() => {
      injectNavCSS();
      removeLegacyNav();
      const slot = ensureNavSlot();
      slot.innerHTML = NAV_HTML;
      highlightActive(slot);
      wireMobileToggle(slot);
      updateAllCartBadges();

      // ---- JS safety net to hide burger on desktop right now ----
      const burg = slot.querySelector('button[data-toggle="mobile"]');
      if (window.innerWidth >= 900 && burg) burg.style.display = 'none';

      window.addEventListener('resize', () => {
        if (!burg) return;
        if (window.innerWidth >= 900) burg.style.display = 'none';
        else burg.style.display = 'inline-flex';
      });

      console.log('[nav] Legacy header injected.');
    });
  });
})();
