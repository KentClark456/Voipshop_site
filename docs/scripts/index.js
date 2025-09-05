document.addEventListener("DOMContentLoaded", () => {
  // ================= GLOBAL IMAGE SETTINGS =================
  const IMAGE_BREAKPOINTS = [480, 800, 1200];
  const IMAGE_SIZES_ATTR  = "(max-width: 600px) 480px, (max-width: 1024px) 800px, 1200px";

  // Build src/srcset/sizes from a single base (no extension)
  function buildImageSources(item){
    if (item.image && item.image.src && item.image.srcset){
      return {
        src: item.image.src,
        srcset: item.image.srcset,
        sizes: item.image.sizes || IMAGE_SIZES_ATTR
      };
    }
    const base = (item.imageBase || "").replace(/\.(png|jpe?g|webp)$/i, "");
    if (!base) return { src:"", srcset:"", sizes: IMAGE_SIZES_ATTR };

    // Safely handle spaces in filenames
    const src = encodeURI(`${base}_800.webp`);
    const srcset = IMAGE_BREAKPOINTS
      .map(w => `${encodeURI(`${base}_${w}.webp`)} ${w}w`)
      .join(", ");

    return { src, srcset, sizes: IMAGE_SIZES_ATTR };
  }

  // Turn your imgAdjust into inline style for the <img>
  function imgStyle(adj = {}){
    const h = adj.h != null ? `height:${adj.h}px;` : "";
    const fit = adj.fit ? `object-fit:${adj.fit};` : "object-fit:contain;";
    const scale = adj.scale != null ? adj.scale : 1;
    const y = adj.y != null ? adj.y : 0;
    const transform = (scale !== 1 || y !== 0) ? `transform: translateY(${y}px) scale(${scale}); transform-origin:center;` : "";
    return `${h} width:100%; ${fit} ${transform}`;
  }

  // --------------- YOUR DATA (updated to imageBase) ---------------
  const packages = [
    {
      id: 1,
      name: "Starter Desk",
      imageBase: "Assets/Yealink T31P",
      devices: [{ device: "Yealink T33G", number: 1 }],
      onceOff: 1450,
      monthly: 280,
      minutesIncluded: 250,
      idealFor: "Single office user with a desk phone",
      imgAdjust: { h: 280, scale: 1.3, y: 7, fit: "contain" }
    },
    {
      id: 2,
      name: "Starter Cordless",
      imageBase: "Assets/Yealink W73P",
      devices: [{ device: "Yealink W73P", number: 1 }],
      onceOff: 2250,
      monthly: 280,
      minutesIncluded: 250,
      idealFor: "Single office user with a cordless phone",
      imgAdjust: { h: 240, scale: 1.2, y: 8, fit: "contain" }
    },
    {
      id: 3,
      name: "Starter Mobile",
      imageBase: "Assets/MobileApp",
      devices: [{ device: "Mobile App", number: 1 }],
      onceOff: 0,
      monthly: 130,
      minutesIncluded: 250,
      idealFor: "App-only package for mobile professionals",
      imgAdjust: { h: 220, scale: 1.25, y: 15, fit: "contain" }
    },
    {
      id: 12,
      name: "Desk Duo",
      imageBase: "Assets/Deskduo",
      devices: [{ device: "Yealink T33G", number: 2 }],
      onceOff: 2900,
      monthly: 430,
      minutesIncluded: 500,
      idealFor: "Two desk phones • Ideal for small offices",
      imgAdjust: { h: 230, scale: 2.0, y: 0, fit: "contain" }
    },
    {
      id: 4,
      name: "Cordless Duo",
      imageBase: "Assets/Cordless duo",
      devices: [
        { device: "Yealink W73P", number: 1 },
        { device: "Yealink W73H", number: 1 }
      ],
      onceOff: 3550,
      monthly: 430,
      minutesIncluded: 500,
      idealFor: "Two cordless phones • Flexible, mobile setup",
      imgAdjust: { h: 235, scale: 1.3, y: 5, fit: "contain" }
    },
    {
      id: 5,
      name: "Hybrid Duo",
      imageBase: "Assets/Hybrid duo",
      devices: [
        { device: "Yealink T33G", number: 1 },
        { device: "Yealink W73P", number: 1 }
      ],
      onceOff: 3700,
      monthly: 430,
      minutesIncluded: 500,
      idealFor: "Desk + cordless phone combo for versatility",
      imgAdjust: { h: 235, scale: 1.8, y: -10, fit: "contain" }
    },
    {
      id: 6,
      name: "Pro Trio",
      imageBase: "Assets/Pro Trio",
      devices: [
        { device: "Yealink T33G", number: 1 },
        { device: "Yealink W73P", number: 1 },
        { device: "Mobile App", number: 1 }
      ],
      onceOff: 3700,
      monthly: 495,
      minutesIncluded: 500,
      idealFor: "Desk, cordless + mobile app • All-in-one setup",
      imgAdjust: { h: 235, scale: 1.9, y: 6, fit: "contain" }
    },
    {
      id: 13,
      name: "Hybrid Trio",
      imageBase: "Assets/hybrid trio",
      devices: [
        { device: "Yealink T33G", number: 1 },
        { device: "Yealink W73P", number: 1 },
        { device: "Yealink W73H", number: 1 }
      ],
      onceOff: 5000,
      monthly: 495,
      minutesIncluded: 500,
      idealFor: "Desk + 2 cordless phones • Small teams",
      imgAdjust: { h: 280, scale: 2.0, y: 10, fit: "contain" }
    },
    {
      id: 14,
      name: "Cordless Trio",
      imageBase: "Assets/cordless trio",
      devices: [
        { device: "Yealink W73P", number: 1 },
        { device: "Yealink W73H", number: 2 }
      ],
      onceOff: 4850,
      monthly: 495,
      minutesIncluded: 500,
      idealFor: "Three cordless phones • Mobile team solution",
      imgAdjust: { h: 240, scale: 1.7, y: 15, fit: "contain" }
    }
  ];

  // ================= Wireless Setups =================
  const wirelessSetups = [
    {
      id: 61,
      category: "Wireless Setups",
      isWireless: true,
      tags: ["wireless"],
      name: "Wireless Desk",
      imageBase: "Assets/Yealink T31P",
      devices: [{ device: "Yealink T31W", number: 1 }],
      extensions: 1,
      onceOff: 1250,
      monthly: 280,
      minutesIncluded: 250,
      idealFor: "Compact WiFi desk phone • No cabling required",
      imgAdjust: { h: 260, scale: 1.28, y: 10, fit: "contain" }
    },
    {
      id: 62,
      category: "Wireless Setups",
      isWireless: true,
      tags: ["wireless"],
      name: "Wireless Handheld",
      imageBase: "Assets/Yealink AX83H",
      devices: [{ device: "Yealink AX83H", number: 1 }],
      extensions: 0,
      onceOff: 2200,
      monthly: 280,
      minutesIncluded: 250,
      idealFor: "WiFi-enabled cordless handset • Plug & play",
      imgAdjust: { h: 240, scale: 1.1, y: 8, fit: "contain" }
    },
    {
      id: 63,
      category: "Wireless Setups",
      isWireless: true,
      tags: ["wireless"],
      name: "Wireless Combo",
      imageBase: "Assets/Wireless Combo", // keep as-is if your files include the space
      devices: [
        { device: "Yealink T31W", number: 1 },
        { device: "Yealink AX83H", number: 1 }
      ],
      extensions: 1,
      onceOff: 1250 + 2299,
      monthly: 345,
      minutesIncluded: 250,
      idealFor: "WiFi desk phone + cordless handset combo",
      imgAdjust: { h: 260, scale: 1.9, y: 2, fit: "contain" }
    }
  ];

  // --------- Merge & expose BEFORE rendering ----------
  const allPackages = [...packages, ...wirelessSetups];
  window.packages = allPackages;

// --------------- CARD BUILDER ---------------
function createPackageCard(pkg, index = 0) {
  const img   = buildImageSources(pkg);
  const style = imgStyle(pkg.imgAdjust);

  const minutesText = typeof pkg.minutesIncluded === "number"
    ? `${pkg.minutesIncluded.toLocaleString("en-ZA")} minutes`
    : (pkg.minutesIncluded || "");

  // Determine device count for this package to detect "Team of 1"
  const deviceCount = (pkg.devices || []).reduce((s, d) => s + (Number(d.number) || 0), 0);
  const isTeamOf1   = deviceCount === 1;

  // Image loading strategy:
  // - Team of 1 (above-the-fold): eager + decoding=auto + high priority
  // - Others: lazy + decoding=async (keep perf wins)
  const imgLoadingAttrs = isTeamOf1
    ? 'loading="eager" fetchpriority="high" decoding="auto"'
    : 'loading="lazy" decoding="async"';

  const card = document.createElement("div");
  card.classList.add("hardware-card", "package-card", "voip-card");
  card.setAttribute("data-id", String(pkg.id));

  card.innerHTML = `
    <div class="hardware-title">
      <h2>${pkg.name}</h2>
      <p>${pkg.idealFor || ""}</p>
    </div>

    <div class="card-image-wrapper" style="height:${(pkg.imgAdjust?.h ?? 200)}px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
      <img
        src="${img.src}"
        srcset="${img.srcset}"
        sizes="${img.sizes}"
        alt="${pkg.name.replace(/"/g,'&quot;')}"
        ${imgLoadingAttrs}
        style="${style}"
      />
    </div>

    <div class="package-meta">
<div class="package-meta">
  <div class="price-list">
    ${minutesText ? `
      <div class="price-line">
        <span class="price-label">Minutes included</span>
        <span class="price-value">${minutesText}</span>
      </div>` : ""}

    <div class="price-line">
      <span class="price-label">Hardware&nbsp;Cost</span>
      <span class="price-value">R ${Number(pkg.onceOff||0).toLocaleString('en-ZA')}</span>
    </div>

    <div class="price-line">
      <span class="price-label">Monthly</span>
      <span class="price-value">
        R ${Number(pkg.monthly||0).toLocaleString('en-ZA')}
        <span class="per">/month</span>
      </span>
    </div>
  </div>

  <button class="select-package-btn" type="button" aria-label="Select ${pkg.name}">
    Select Package
  </button>
</div>

  `;
const btn = card.querySelector(".select-package-btn");
if (btn) {
  btn.addEventListener("click", (e) => {
    if (typeof window.selectPackage === "function") {
      // Pass the event + the package so selectPackage can reliably find the invoker card
      window.selectPackage(e, pkg);
    } else {
      window.dispatchEvent(new CustomEvent("package:selected", { detail: pkg }));
    }
  });
}


  return card;
}


function renderPackageCards() {
  // Prefer data attribute → plural ID → legacy singular ID
  const row1 = document.querySelector('[data-packages-row="1"]')
            || document.getElementById('row-1-extensions')
            || document.getElementById('row-1-extension');

  const row2 = document.querySelector('[data-packages-row="2"]')
            || document.getElementById('row-2-extensions');

  const row3 = document.querySelector('[data-packages-row="3"]')
            || document.getElementById('row-3-extensions');

  [row1, row2, row3].forEach(c => c && (c.innerHTML = ""));

  const teamPkgs = (window.packages || []).filter(p => p.category !== "Wireless Setups");

  teamPkgs.forEach((pkg, i) => {
    const card = createPackageCard(pkg, i);
    const total = (pkg.devices || []).reduce((s, d) => s + (Number(d.number) || 0), 0);

    if (total === 1 && row1) row1.appendChild(card);
    else if (total === 2 && row2) row2.appendChild(card);
    else if (total === 3 && row3) row3.appendChild(card);
    else console.warn(`Package "${pkg.name}" has ${total} devices — no matching row.`);
  });
}


  function renderWirelessSection() {
    const wrap = document.getElementById("wireless-cards");
    if (!wrap) {
      console.warn('Missing #wireless-cards container; Wireless Setups will not render.');
      return;
    }
    wrap.innerHTML = "";
    (window.packages || [])
      .filter(p => p.category === "Wireless Setups")
      .forEach((pkg, i) => wrap.appendChild(createPackageCard(pkg, i)));
  }

  // --------------- Smooth scroll helpers ---------------
  function scrollToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // --------------- Init ---------------
  renderPackageCards();
  renderWirelessSection();

  const moreBtn = document.querySelector(".more-options-btn");
  if (moreBtn && typeof window.toggleMoreOptions === "function") {
    moreBtn.addEventListener("click", window.toggleMoreOptions);
  }

  const ctaButton = document.querySelector(".cta-button");
  if (ctaButton) {
    ctaButton.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToSection("packages");
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      if (targetId) {
        scrollToSection(targetId);
        const dropdown = document.querySelector(".drop-down");
        const menu = document.querySelector(".menu");
        if (dropdown && dropdown.classList.contains("show-menu")) {
          dropdown.classList.remove("show-menu");
          if (menu) menu.classList.remove("opened");
        }
      }
    });
  });

  // tiny API for debugging/other scripts
  window.VoIPHome = {
    packages: window.packages,
    selectPackage: window.selectPackage,
    scrollToSection
  };
});

/* ============================================================
   scripts/index.js — Packages page logic:
   scrollspy, rail toggle, selectPackage + summary + card highlight
   (runs only if body has class "packages-page")
============================================================ */
(function () {
  const onPackages = () => document.body.classList.contains('packages-page');
  if (!onPackages()) return;

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const toNum = (v) => Number(String(v ?? '').replace(/[^\d.]/g, '')) || 0;
  const fmtR  = (n) => `R ${Number(n || 0).toLocaleString('en-ZA')}`;

  let __lastClicked = null;
  document.addEventListener('mousedown', (e) => { __lastClicked = e.target; }, true);
  document.addEventListener('touchstart', (e) => { __lastClicked = e.target; }, true);

  const CARD_SEL = '.package-card, .bundle-card, .hardware-card, .card, article, li';
  function clearPackageHighlights() {
    $$(CARD_SEL).forEach(el => el.classList.remove('is-selected','blue-ring','checkout-ring'));
  }
  function ring(el, on=true) {
    if (!el) return;
    el.classList.toggle('is-selected', !!on);
    el.classList.toggle('blue-ring',  !!on);
    if (on) {
      el.classList.add('checkout-ring');
      setTimeout(() => el.classList.remove('checkout-ring'), 380);
    } else {
      el.classList.remove('checkout-ring');
    }
  }
  function findCardFrom(el) { return el?.closest?.(CARD_SEL) || null; }
  function findCardByLabel(label) {
    if (!label) return null;
    const q = String(label).toLowerCase().trim();
    return $$(CARD_SEL).find(el => (el.textContent || '').toLowerCase().includes(q)) || null;
  }
  function highlightInvokerCard(invoker, label) {
    let card = findCardFrom(invoker);
    if (!card && label) card = findCardByLabel(label);
    if (!card) return;
    clearPackageHighlights();
    ring(card, true);
  }

  (function scrollSpy() {
    const rail  = $('.rail');
    const links = $$('.rail-list a');
    if (!rail || !links.length) return;

    const ids = links
      .map(a => a.getAttribute('href'))
      .filter(h => h && h.startsWith('#'))
      .map(h => h.slice(1));

    const sections = ids.map(id => document.getElementById(id)).filter(Boolean);

    const setActive = (id) => {
      links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href')?.slice(1) === id));
    };

    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter(e => e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if (vis) setActive(vis.target.id);
    }, { rootMargin: "-40% 0px -55% 0px", threshold: [0,0.25,0.5,0.75,1] });

    sections.forEach(s => io.observe(s));
    links.forEach(a => a.addEventListener('click', () => {
      const id = a.getAttribute('href')?.slice(1);
      if (id) setActive(id);
    }));
  })();

  (function railToggle() {
    const rail   = $('.rail');
    const toggle = $('.rail-toggle');
    if (!rail || !toggle) return;

    const isMobile = () => window.matchMedia('(max-width:1025px)').matches;
    toggle.setAttribute('aria-expanded', rail.getAttribute('data-state') !== 'collapsed');

    toggle.addEventListener('click', () => {
      if (isMobile()) {
        const open = rail.getAttribute('data-open') === 'true';
        rail.setAttribute('data-open', String(!open));
        toggle.setAttribute('aria-expanded', String(!open));
      } else {
        const collapsed = rail.getAttribute('data-state') === 'collapsed';
        rail.setAttribute('data-state', collapsed ? 'expanded' : 'collapsed');
        toggle.setAttribute('aria-expanded', String(!collapsed));
      }
    });

    window.addEventListener('resize', () => {
      if (!isMobile()) rail.removeAttribute('data-open');
    });
  })();

  (function selectPackageAPI() {
    const summarySection = document.getElementById('package-summary');
    const summaryCard    = summarySection?.querySelector('.rounded-2xl');
    const monthlyEl      = document.getElementById('total-footer-price');
    const onceoffEl      = document.getElementById('total-onceoff');
    const periodEl       = document.getElementById('total-cost-period');

    function setSummaryHighlight(on){
      if (!summaryCard) return;
      summaryCard.classList.toggle('checkout-ring', !!on);
    }

    function scrollToSummary(offset = 8) {
      if (!summarySection) return;
      try { summarySection.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) {}
      const y = summarySection.getBoundingClientRect().top + (window.pageYOffset || window.scrollY) - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }

    window.selectPackage = function (arg1, arg2, arg3) {
      let label, monthly, onceOff, devices = [], minutesIncluded;
      let invokerEl = null;

      if (arg1 && typeof arg1 === 'object' && ('target' in arg1 || 'currentTarget' in arg1)) {
        invokerEl = arg1.currentTarget || arg1.target;
        const pkg = arg2;
        if (pkg && typeof pkg === 'object') {
          label = pkg.name || pkg.label || 'Package';
          monthly = pkg.monthly;
          onceOff = pkg.onceOff;
          devices = Array.isArray(pkg.devices) ? pkg.devices : [];
          minutesIncluded = pkg.minutesIncluded ?? pkg.minutes;
        }
      } else if (arg1 && arg1?.nodeType === 1) {
        invokerEl = arg1;
        const pkg = arg2;
        if (pkg && typeof pkg === 'object') {
          label = pkg.name || pkg.label || 'Package';
          monthly = pkg.monthly;
          onceOff = pkg.onceOff;
          devices = Array.isArray(pkg.devices) ? pkg.devices : [];
          minutesIncluded = pkg.minutesIncluded ?? pkg.minutes;
        } else {
          label = 'Package';
          monthly = arg2; onceOff = arg3;
        }
      } else if (arg1 && typeof arg1 === 'object') {
        const pkg = arg1;
        label = pkg.name || pkg.label || 'Package';
        monthly = pkg.monthly;
        onceOff = pkg.onceOff;
        devices = Array.isArray(pkg.devices) ? pkg.devices : [];
        minutesIncluded = pkg.minutesIncluded ?? pkg.minutes;
        invokerEl = __lastClicked;
      } else {
        label = arg1;
        monthly = arg2;
        onceOff = arg3;
        invokerEl = __lastClicked;
      }

      const m = toNum(monthly);
      const o = toNum(onceOff);

      if (monthlyEl) monthlyEl.textContent = fmtR(m);
      if (onceoffEl) onceoffEl.textContent = fmtR(o);
      if (periodEl)  periodEl.textContent  = '/mo.';

   // NEW: include image info for checkout
let imageBase = null, imgAdjust = null, image = null;

try {
  // If caller passed the actual package object, grab its image data
  if (arg1 && typeof arg1 === 'object' && (arg1.name || arg1.label) && (arg1.imageBase || arg1.image || arg1.imgAdjust)) {
    imageBase = arg1.imageBase || null;
    imgAdjust = arg1.imgAdjust || null;
    image = (typeof buildImageSources === 'function') ? buildImageSources(arg1) : null;
  } else {
    // Fallback: find the package by label in window.packages
    const pkgMatch = (window.VoIPHome?.packages || window.packages || []).find(
      p => (p.name || '').trim() === (label || '').trim()
    );
    if (pkgMatch) {
      imageBase = pkgMatch.imageBase || null;
      imgAdjust = pkgMatch.imgAdjust || null;
      image = (typeof buildImageSources === 'function') ? buildImageSources(pkgMatch) : null;
    }
  }
} catch (e) {
  console.warn('Image payload build failed:', e);
}

const payload = {
  label,
  name: label,
  monthly: m,
  onceOff: o,
  devices,
  minutesIncluded,
  // NEW fields for checkout rendering:
  imageBase,
  imgAdjust,
  image // { src, srcset, sizes }
};

window.__selectedPackage = payload;

try { localStorage.setItem('voip:selectedPackage', JSON.stringify(payload)); }
catch (e) { console.warn('localStorage failed:', e); }

highlightInvokerCard(invokerEl, label);
setSummaryHighlight(true);
scrollToSummary();

return false;

    };

    setSummaryHighlight(false);
  })();
})();
