// scripts/footer.js
(function () {
  const MOUNT_ID = 'site-footer';

  async function init() {
    const host = document.getElementById(MOUNT_ID);
    if (!host) return;

    // Resolve the partial relative to the current page (robust for /docs or root)
    const partialURL = new URL('partials/footer.html', window.location.href);

    let html = null;
    try {
      const res = await fetch(partialURL.toString(), { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (err) {
      console.warn('[footer] Failed to load:', partialURL.toString(), err);
    }

    if (!html) {
      host.innerHTML = `
        <footer class="bg-white border-t border-gray-200 px-6 py-6 text-sm text-gray-600">
          <div class="max-w-screen-xl mx-auto">
            Footer failed to load. Check path: <code>${partialURL.pathname}</code>
          </div>
        </footer>`;
      return;
    }

    host.innerHTML = html;

    // Dynamic year
    const y = host.querySelector('#year');
    if (y) y.textContent = new Date().getFullYear();

    // Variants: full | thin | checkout
    const variant = host.dataset.variant || 'full';

    if (variant === 'thin') {
      host.querySelector('nav[aria-label="Footer navigation"]')?.classList.add('hidden', 'sm:block');
      const wrap = host.querySelector('.py-12');
      if (wrap) { wrap.classList.remove('py-12'); wrap.classList.add('py-6'); }
    }

    if (variant === 'checkout') {
      host.querySelector('nav[aria-label="Footer navigation"]')?.remove();
      host.querySelector('p.mt-3')?.remove();
      const wrap = host.querySelector('.py-12');
      if (wrap) { wrap.classList.remove('py-12'); wrap.classList.add('py-4'); }
    }
  }

  if (location.protocol === 'file:') {
    console.warn('[footer] You are opening via file:// — use a local server (e.g., VS Code Live Server) so fetch works.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
