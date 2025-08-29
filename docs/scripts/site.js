// docs/scripts/site.js — compatibility layer for new partial nav + legacy fallback
(function () {
  // ---------- Helpers shared by both nav versions ----------
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
        el.setAttribute('data-show', 'true'); // used by new partial CSS
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

  // Re-run badge updates on load and when storage changes
  document.addEventListener('DOMContentLoaded', updateAllCartBadges);
  window.addEventListener('storage', (e) => {
    if (['voip:customBuild','voip:selectedPackage'].includes(e.key)) updateAllCartBadges();
  });

  // ---------- Decide: new partial present? then skip legacy injection ----------
  document.addEventListener('DOMContentLoaded', () => {
    const hasNewPartial =
      document.getElementById('mobile-nav') ||           // off-canvas container from new partial
      document.getElementById('menu-toggle');            // hamburger button from new partial

    if (hasNewPartial) {
      console.log('[nav] New partial detected — skipping legacy injection.');
      return; // ✅ Let the new partial handle everything (including its own JS/CSS)
    }

    // ---------- Legacy nav injection (only if partial is NOT present) ----------

    // If you also rely on Tailwind utilities elsewhere, keep a small safelist:
    const TW_SAFELIST = [
      'bg-white/90','border-b','border-gray-200','sticky','top-0','z-50','backdrop-blur',
      'max-w-screen-xl','mx-auto','px-6','py-4','flex','items-center','justify-between',
      'gap-3','gap-8','text-sm','font-medium','tracking-tight','text-gray-700',
      'hover:text-black','relative','text-blue-600','h-5','w-5',
      'absolute','-top-1','-right-2','bg-blue-600','text-white','text-[10px]','font-bold','px-1.5','rounded-full'
    ];

    function ensureTailwind() {
      return new Promise((resolve, reject) => {
        if (document.querySelector('script[src*="cdn.tailwindcss.com"]')) return resolve();
        window.tailwind = { config: { safelist: TW_SAFELIST } };
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
      document.querySelectorAll('header.site-navbar, header[data-legacy-nav], header[role="banner"]')
        .forEach(el => el.remove());
    }

    function injectNavCSS() {
      if (document.querySelector('style[data-nav-style]')) return;
      const css = `
        #nav-slot { display:block; }
        #nav-slot > header{
          max-width:none !important; margin:0 !important; width:100vw !important;
          margin-left:calc(50% - 50vw) !important; margin-right:calc(50% - 50vw) !important;
          position:sticky; top:0; z-index:50;
          background:rgba(255,255,255,.9);
          backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
          border-bottom:1px solid #e5e7eb; text-align:initial !important;
        }
      `;
      const style = document.createElement('style');
      style.setAttribute('data-nav-style', '1');
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
    }

    function injectNavLock() {
      if (document.querySelector('style[data-nav-style-lock]')) return;
      const css = `
        #nav-slot, #nav-slot * { box-sizing:border-box; max-width:none !important; }
        #nav-slot { font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display",Segoe UI,Roboto,Helvetica,Arial,sans-serif !important; }
        #nav-slot > header { text-align:initial !important; }
        #nav-slot > header > div{
          margin:0 !important; width:100% !important;
          display:flex !important; align-items:center !important; justify-content:space-between !important; gap:24px !important;
          padding:12px 24px 12px 12px !important;
        }
        #nav-slot nav { margin-left:auto !important; display:inline-flex !important; align-items:center !important; gap:32px !important; }
        #nav-slot a { color:#374151 !important; text-decoration:none !important; font:500 14px/1.2 system-ui !important; letter-spacing:0 !important; }
        #nav-slot a:hover { color:#000 !important; }
        #nav-slot nav a[aria-current="page"] { color:#000 !important; }
        #nav-slot svg { display:block !important; }
      `;
      const style = document.createElement('style');
      style.setAttribute('data-nav-style-lock', '1');
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
    }

    const NAV_HTML = `
<header style="
  width:100vw; margin-left:calc(50% - 50vw); margin-right:calc(50% - 50vw);
  position:sticky; top:0; z-index:50;
  background:rgba(255,255,255,.9); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
  border-bottom:1px solid #e5e7eb; text-align:initial;">
  <div style="
    width:100%; max-width:none; margin:0;
    padding:12px 24px 12px 12px; box-sizing:border-box;
    display:flex; align-items:center; gap:24px; justify-content:space-between;">
    <a href="index.html" aria-label="VoIP Shop — Home"
       style="display:inline-flex; align-items:center; gap:12px; text-decoration:none; margin-left:12px !important;">
      <img src="Assets/Group 1642logo (1).png" alt="VoIP Shop Logo"
           style="height:32px; width:auto; object-fit:contain; display:block;">
    </a>
    <nav aria-label="Primary"
         style="margin-left:auto; display:inline-flex; align-items:center; gap:32px;">
      <a href="packages.html"          style="color:#374151; font:500 14px/1.2 system-ui; text-decoration:none;">Packages</a>
      <a href="build-solution.html"    style="color:#374151; font:500 14px/1.2 system-ui; text-decoration:none;">Custom Build</a>
      <a href="voice-services.html"    style="color:#374151; font:500 14px/1.2 system-ui; text-decoration:none;">Voice Services</a>
      <a href="mobile-app.html"        style="color:#374151; font:500 14px/1.2 system-ui; text-decoration:none;">Mobile App</a>
      <a href="contact.html"           style="color:#374151; font:500 14px/1.2 system-ui; text-decoration:none;">Contact Us</a>

      <a href="checkout.html" title="Cart"
         style="position:relative; display:inline-flex; align-items:center; color:#0B63E6; text-decoration:none;">
        <svg viewBox="0 0 24 24" aria-hidden="true" style="height:20px; width:20px; display:block;">
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 7h13l-1.5-7M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span id="cart-count" hidden
              style="position:absolute; top:-6px; right:-8px; background:#0B63E6; color:#fff;
                     font:700 10px/1 system-ui; padding:2px 6px; border-radius:999px;"></span>
      </a>

      <a href="login.html" title="Account" aria-label="Account"
         style="display:inline-flex; align-items:center; color:#374151; text-decoration:none;">
        <svg viewBox="0 0 24 24" aria-hidden="true" style="height:20px; width:20px; display:block;">
          <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2"/>
          <path d="M5.5 21a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </a>
    </nav>
  </div>
</header>`.trim();

    function highlightActive(slot) {
      const current = location.pathname.replace(/index\.html$/, '').replace(/\/+$/, '');
      slot.querySelectorAll('nav a[href]').forEach(a => {
        const href = new URL(a.getAttribute('href'), location.href)
          .pathname.replace(/index\.html$/, '').replace(/\/+$/, '');
        if (href === current) a.setAttribute('aria-current', 'page');
      });
    }

    ensureTailwind().finally(() => {
      injectNavCSS();
      injectNavLock();
      removeLegacyNav();
      const slot = ensureNavSlot();
      slot.innerHTML = NAV_HTML;
      highlightActive(slot);
      updateAllCartBadges();
      console.log('[nav] Legacy header injected (no partial found).');
    });
  });
})();
