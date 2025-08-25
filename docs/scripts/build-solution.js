// ===============================
// build-solution.js  (responsive images + LAZY LOADING)
// ===============================

// ---------- Responsive image helpers ----------
const IMAGE_BREAKPOINTS = [480, 800, 1200];
const IMAGE_SIZES_ATTR  = "(max-width: 600px) 480px, (max-width: 1024px) 800px, 1200px";

// 1x1 transparent SVG (keeps layout stable before real image loads)
const TRANSPARENT_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E";

/**
 * Build {src, srcset, sizes, fallback} from either:
 *  - imageBase: "Assets/Yealink T73U" -> looks for *_480.webp, *_800.webp, *_1200.webp
 *  - image: "Assets/yealinkT73U.png"  -> uses this single file, no srcset
 * You can also pass an explicit { image: { src, srcset, sizes } } to fully override.
 */
function buildImageSources(item) {
  // Full override
  if (item.image && typeof item.image === "object" && item.image.src) {
    return {
      src: item.image.src,
      srcset: item.image.srcset || "",
      sizes: item.image.sizes || IMAGE_SIZES_ATTR,
      fallback: "" // unknown
    };
  }

  // Preferred: imageBase (no extension)
  if (item.imageBase) {
    const base = String(item.imageBase).replace(/\.(png|jpe?g|webp|avif)$/i, "");
    const enc  = (p) => encodeURI(p);
    const src  = enc(`${base}_800.webp`);
    const srcset = IMAGE_BREAKPOINTS.map(w => `${enc(`${base}_${w}.webp`)} ${w}w`).join(", ");
    // Try a sensible PNG fallback path if a WebP ever fails
    const fallback = enc(`${base}_800.png`);
    return { src, srcset, sizes: IMAGE_SIZES_ATTR, fallback };
  }

  // Legacy single file path → no srcset
  if (item.image && typeof item.image === "string") {
    return { src: encodeURI(item.image), srcset: "", sizes: IMAGE_SIZES_ATTR, fallback: "" };
  }

  return { src: "", srcset: "", sizes: IMAGE_SIZES_ATTR, fallback: "" };
}

function imgStyle(adj = {}) {
  const h      = adj.h != null ? `height:${adj.h}px;` : "";
  const fit    = adj.fit ? `object-fit:${adj.fit};` : "object-fit:contain;";
  const scale  = adj.scale != null ? adj.scale : 1;
  const y      = adj.y != null ? adj.y : 0;
  const x      = adj.x != null ? adj.x : 0;
  const origin = adj.origin || "center bottom";
  const transform = (scale !== 1 || y !== 0 || x !== 0)
    ? `transform: translate(${x}px, ${y}px) scale(${scale}); transform-origin:${origin};`
    : `transform-origin:${origin};`;
  return `${h} width:auto; max-width:100%; display:block; ${fit} ${transform}`;
}


// ---- Data ---------------------------------------------------------
const hardwareItems = {
  main: [
    { id:'yealink-t44u', category:'Switchboard', name:'Yealink T73U',
      description:'Entry reception phone • 1–5 users • 8 programmable transfer keys',
      imageBase:'Assets/YealinkT73U', alt:'Yealink T73U phone',
      basePrice:1995, basePriceEx:1995, isBaseStation:false,
      imgAdjust:{ h:230, scale:1.3, y:33, fit:'contain', origin:'center bottom' } },

    { id:'switchboard-placeholder-1', category:'Switchboard', name:'Yealink T74U',
      description:'Mid-range reception phone • 5–10 users • 10 programmable transfer keys',
      imageBase:'Assets/Yealink T74U', alt:'Yealink T74U phone',
      basePrice:2995, basePriceEx:2995, isBaseStation:false,
      imgAdjust:{ h:230, scale:1.38, y:50, fit:'contain' } },

    { id:'switchboard-placeholder-2', category:'Switchboard', name:'Yealink T77U',
      description:'Executive reception phone • 10+ users • multiple programmable transfer keys',
      imageBase:'Assets/Yealink T77U', alt:'Yealink T77U phone',
      basePrice:3995, basePriceEx:3995, isBaseStation:false,
      imgAdjust:{ h:230, scale:1.4, y:35, fit:'contain' } },

    { id:'yealink-t31p', category:'Desk Phone', name:'Yealink T31P',
      description:'Entry desk phone • 2 programmable keys • B/W screen',
      imageBase:'Assets/Yealink T31P', alt:'Yealink T31P phone',
      basePrice:1100, basePriceEx:1100, isBaseStation:false,
      imgAdjust:{ h:100, scale:1.2, y:32, fit:'contain' } },

    { id:'deskphone-placeholder-1', category:'Desk Phone', name:'Yealink T33G',
      description:'High-end desk phone • 4 programmable keys • colour screen',
      imageBase:'Assets/Yealink T33G', alt:'Yealink T33G phone',
      basePrice:1450, basePriceEx:1450, isBaseStation:false,
      imgAdjust:{ h:225, scale:1.3, y:37, fit:'contain' } },

    { id:'deskphone-placeholder-2', category:'Desk Phone', name:'Yealink T73U',
      description:'Executive desk phone • 10 programmable keys • colour screen',
      imageBase:'Assets/YealinkT73U', alt:'Yealink T73U phone',
      basePrice:1995, basePriceEx:1995, isBaseStation:false,
      imgAdjust:{ h:225, scale:1.3, y:33, fit:'contain', origin:'center bottom' } },

    { id:'yealink-W73h', category:'Cordless', name:'Yealink W73H',
      description:'Standard cordless • 50m indoor range • colour screen',
      imageBase:'Assets/Yealink W73H', alt:'Yealink W73H handset',
      basePrice:1300, basePriceEx:1250, requiresBaseStation:true, isBaseStation:false,
      imgAdjust:{ h:240, scale:1.0, y:10, fit:'contain' } },

    { id:'cordless-placeholder-1', category:'Cordless', name:'Yealink W59R',
      description:'Ruggedised cordless for heavy use • 50m indoor range',
      imageBase:'Assets/YealinkW59R', alt:'Yealink W59R handset',
      basePrice:2450, basePriceEx:2450, requiresBaseStation:true, isBaseStation:false,
      imgAdjust:{ h:240, scale:1.05, y:13, fit:'contain' } },

    { id:'cordless-placeholder-2', category:'Cordless', name:'Base Station',
      description:'Cordless base station • supports up to 8 handsets • no display',
      imageBase:'Assets/Yealink W70B', alt:'Yealink W70B base station',
      basePrice:950, basePriceEx:950, isBaseStation:true, supportsHandsets:8,
      imgAdjust:{ h:210, scale:1.2, y:20, fit:'contain' } }
  ]
};

// ---- Globals ------------------------------------------------------
window.selectedHardware = window.selectedHardware || {};
const SH = window.selectedHardware;

// ---- Utils --------------------------------------------------------
function n(v){ const num = Number(String(v ?? '').replace(/[^\d.-]/g,'')); return Number.isFinite(num)?num:0; }
function money(v){ return 'R ' + Math.round(n(v)).toLocaleString('en-ZA'); }
function slug(s){ return String(s||'').toLowerCase().replace(/\s+/g,'-').replace(/[^\w\-]+/g,''); }
function isBaseStationLike(s=''){ return /w70b|base\s*station|dect\s*base/i.test(String(s)); }

// ---- Card template ------------------------------------------------
function cardHTML(item, idx = 0){
  const isBS = !!item.isBaseStation || isBaseStationLike(item.id) || isBaseStationLike(item.name);
  const a = item.imgAdjust || {};
  const wrapperH = (a.h ?? 200) + 'px';
  const baseEx = Number(item.basePriceEx ?? item.basePrice ?? 0) || 0;
  const base   = Number(item.basePrice   ?? baseEx) || 0;

  const img = buildImageSources(item);
  const style = imgStyle(a);

  // make first couple of images eager/high priority for faster LCP
  const eager = idx < 2;

  return `
  <div class="hardware-card voip-card"
       ${isBS ? `id="base-station-card" data-base-station="true" data-supports="${Number(item.supportsHandsets || 8)}"` : ''}
       data-id="${String(item.id)}"
       data-name="${String(item.name)}"
       data-category="${String(item.category)}">
    <div class="hardware-title">
      ${item.category ? `<h3>${item.category}</h3>` : ``}
      <h2>${item.name || ''}</h2>
      ${item.description ? `<p>${item.description}</p>` : ``}
    </div>

    <div class="card-image-wrapper" style="height:${wrapperH};display:flex;align-items:center;justify-content:center;overflow:hidden;">
      <img
        class="hardware-img img-${slug(item.id || item.name)}"
        src="${eager ? img.src : TRANSPARENT_PLACEHOLDER}"
        ${eager && img.srcset ? `srcset="${img.srcset}"` : ""}
        ${eager ? `sizes="${img.sizes}" fetchpriority="high" loading="eager"` : `loading="lazy" fetchpriority="low"`}
        ${!eager ? `data-src="${img.src}"` : ""}
        ${!eager && img.srcset ? `data-srcset="${img.srcset}"` : ""}
        ${!eager ? `data-sizes="${img.sizes}"` : ""}
        ${img.fallback ? `data-fallback="${img.fallback}"` : ""}
        alt="${(item.alt || item.name || '').replace(/"/g,'&quot;')}"
        decoding="async"
        style="${style}"
      />
    </div>

    <div class="hardware-bottom">
      <div class="hardware-price">
        <span class="price-value" data-base-price="${base}" data-base-price-ex="${baseEx}">${money(base)}</span>
        <span class="price-label">Once-off</span>
      </div>

      <div class="hardware-qty-container">
        <button class="hardware-minus" onclick="updateHardware(event,false)" aria-label="Decrease">
          <img src="Assets/minus.png" alt="Decrease">
        </button>
        <div class="hardware-qty" data-qty="0">0</div>
        <button class="hardware-add" onclick="updateHardware(event,true)" aria-label="Increase">
          <img src="Assets/Plus.png" alt="Increase">
        </button>
      </div>
    </div>
  </div>`;
}

function renderCards(){
  const containers = {
    'Switchboard': document.getElementById('switchboard-container'),
    'Desk Phone' : document.getElementById('deskphone-container'),
    'Cordless'   : document.getElementById('cordless-container'),
  };
  hardwareItems.main.forEach((item, idx)=>{
    const c = containers[item.category];
    if (c) c.insertAdjacentHTML('beforeend', cardHTML(item, idx));
  });
}

// Polyfill for CSS.escape on Safari (or any browser missing it)
if (typeof CSS === 'undefined' || typeof CSS.escape !== 'function') {
  window.CSS = window.CSS || {};
  CSS.escape = function (sel) {
    return String(sel).replace(/[^a-zA-Z0-9_\u00A0-\uFFFF-]/g, '\\$&');
  };
}

// ---- Totals -------------------------------------------------------
const BASE_MONTHLY = 150;
const PER_EXT      = 65;

function recalcTotals(){
  const entries = Object.values(SH);

  const onceOff = entries.reduce((s,it)=> s + n(it.qty)*n(it.onceOffEx), 0);
  const exts    = entries.reduce((s,it)=> s + (it.isBaseStation ? 0 : n(it.qty)), 0);
  const monthly = exts > 0 ? BASE_MONTHLY + PER_EXT*exts : 0;

  // Paint UI
  const monthlyEl = document.getElementById('total-footer-price');
  const onceOffEl = document.getElementById('total-onceoff');
  if (monthlyEl) monthlyEl.textContent = money(monthly);
  if (onceOffEl) onceOffEl.textContent = money(onceOff);

  const pTotal  = document.getElementById('proceed-total');
  const pPeriod = document.getElementById('proceed-period');
  if (pTotal)  pTotal.textContent  = money(onceOff);
  if (pPeriod) pPeriod.textContent = '/mo.';

  try { persistCustomBuild(exts); } catch (e) { console.warn('persistCustomBuild failed:', e); }
  saveSolutionTotals({ monthly, onceOff });
}
window.recalcTotals = recalcTotals;


// ---- Helpers for qty & ring --------------------------------------
function bsCard(){ return document.querySelector('.hardware-card[data-base-station="true"], #base-station-card'); }
function cardById(id){ return document.querySelector(`.hardware-card[data-id="${CSS.escape(id)}"]`); }
function qtyFrom(card){ const el = card?.querySelector('.hardware-qty'); return n(el?.textContent || el?.dataset?.qty); }
function setQty(card,q){ const el = card?.querySelector('.hardware-qty'); if(!el) return; el.textContent=String(q); el.dataset.qty=String(q); }

function ringElement(card){ return card; }
function setRing(card, on) {
  const el = ringElement(card);
  if (!el) return;
  el.classList.toggle('is-selected', on);
  el.classList.toggle('blue-ring', on);
  if (on) {
    el.classList.add('checkout-ring');
    setTimeout(() => el.classList.remove('checkout-ring'), 300);
  } else {
    el.classList.remove('checkout-ring');
  }
}

// ---- Visual bump for +1 feedback ---------------------------------
function ensureBumpStyles(){
  if (document.getElementById('qty-bump-styles')) return;
  const css = `
    .qty-bump { transform: scale(1.08); transition: transform 140ms ease; }
    .qty-bump-reset { transform: none; transition: transform 120ms ease; }
  `;
  const tag = document.createElement('style');
  tag.id = 'qty-bump-styles';
  tag.textContent = css;
  document.head.appendChild(tag);
}

function bumpQtyUI(card){
  const qty = card.querySelector('.hardware-qty');
  const plus = card.querySelector('.hardware-add');
  [qty, plus].forEach(el=>{
    if (!el) return;
    el.classList.remove('qty-bump-reset');
    void el.offsetWidth;
    el.classList.add('qty-bump');
    setTimeout(()=> {
      el.classList.remove('qty-bump');
      el.classList.add('qty-bump-reset');
    }, 150);
  });
}

// ---- Auto base station -------------------------------------------
function cordlessTotal(){
  return Object.values(SH).reduce((total,it)=>{
    const c   = cardById(it.id);
    const isBS = c?.hasAttribute('data-base-station') || isBaseStationLike(c?.id) || it.isBaseStation;
    const cat  = c?.dataset?.category || '';
    return total + (!isBS && /cordless/i.test(cat) ? n(it.qty) : 0);
  },0);
}

// Auto-scale base station: qty = ceil(cordless / supports)
function syncBase(){
  const base = bsCard(); if(!base) return;

  const supports = Number(base.getAttribute('data-supports')) || 8;
  const bsId     = base.dataset.id || base.id || 'base-station';
  const unitEx   = n(base.querySelector('.price-value')?.dataset?.basePriceEx);

  const cordlessNeeded = cordlessTotal();
  const required = cordlessNeeded > 0 ? Math.ceil(cordlessNeeded / supports) : 0;

  const currentDOM = n(base.querySelector('.hardware-qty')?.dataset?.qty);
  if (required === currentDOM) return;

  if (required > 0) {
    SH[bsId] = {
      id: bsId,
      name: base.dataset.name || 'Base Station',
      qty: required,
      onceOffEx: unitEx,
      isBaseStation: true
    };
    setQty(base, required);
    base.classList.add('has-qty');
    setRing(base, true);
    bumpQtyUI(base);
  } else {
    delete SH[bsId];
    setQty(base, 0);
    base.classList.remove('has-qty');
    setRing(base, false);
    bumpQtyUI(base);
  }
}

// ---- Single updateHardware (apply ring here) ----------------------
window.updateHardware = function updateHardware(e, inc){
  const card = e?.currentTarget?.closest('.hardware-card'); if(!card) return;

  const id   = card.dataset.id || '';
  const name = card.dataset.name || card.querySelector('.hardware-title h2')?.textContent || '';
  const qEl  = card.querySelector('.hardware-qty');

  let q = parseInt(qEl?.textContent || qEl?.dataset?.qty || '0', 10) || 0;
  q = Math.max(0, q + (inc ? 1 : -1));

  qEl.textContent = String(q);
  qEl.dataset.qty = String(q);

  card.classList.toggle('has-qty', q > 0);

  const unitEx = n(card.querySelector('.price-value')?.dataset?.basePriceEx);
  const isBS   = card.hasAttribute('data-base-station') || isBaseStationLike(id) || isBaseStationLike(name);

  if (q > 0) {
    SH[id] = { id, name, qty:q, onceOffEx:unitEx, isBaseStation:isBS };
  } else {
    delete SH[id];
  }

  try { syncBase(); } catch (err) { console.warn('syncBase failed:', err); }
  recalcTotals();

  setRing(card, q > 0);
};

// ---- LAZY LOADER --------------------------------------------------
// Uses IntersectionObserver to swap data-src/srcset into real src/srcset
function installLazyLoader(){
  const supportsIO = "IntersectionObserver" in window;
  const imgs = Array.from(document.querySelectorAll('img.hardware-img'));

  if (!supportsIO) {
    // Fallback: load all immediately
    imgs.forEach(loadImgNow);
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const img = entry.target;
      loadImgNow(img);
      obs.unobserve(img);
    }
  }, { root: null, rootMargin: "200px 0px", threshold: 0.01 });

  imgs.forEach(img => {
    // First two may be eager/high already; only observe lazies
    if (!img.dataset.src && !img.dataset.srcset) return;
    io.observe(img);
  });
}

function loadImgNow(img){
  const dataSrc    = img.getAttribute('data-src');
  const dataSrcset = img.getAttribute('data-srcset');
  const dataSizes  = img.getAttribute('data-sizes');
  const fallback   = img.getAttribute('data-fallback');

  if (dataSrc)    img.src = dataSrc;
  if (dataSrcset) img.srcset = dataSrcset;
  if (dataSizes)  img.sizes = dataSizes;

  // Try decoding for smoother reveal; ignore errors
  if (img.decode) { img.decode().catch(()=>{}); }

  // If a WebP ever fails, try PNG fallback (best-effort)
  if (fallback) {
    img.onerror = () => {
      img.onerror = null;
      img.srcset = "";
      img.src = fallback;
    };
  }
}

// ---- Boot ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  renderCards();
  recalcTotals();
  ensureBumpStyles();

  // Apply selected ring state for any prefilled qty
  document.querySelectorAll('.hardware-card').forEach(card => {
    const q = qtyFrom(card);
    setRing(card, q > 0);
  });

  // Install lazy loader after cards are in the DOM
  installLazyLoader();
});

// ---- Stable left-rail scroll-spy ---------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if (window.__railSpyInstalled) return;
  window.__railSpyInstalled = true;

  const links = Array.from(document.querySelectorAll('.rail-list a[href^="#"]'));
  const sections = links
    .map(a => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);
  if (!sections.length) return;

  const setActive = (id) => {
    if (!id) return;
    links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href').slice(1) === id));
  };

  const navOffset = () => {
    const nav = document.querySelector('[data-site-nav]') || document.querySelector('header, nav');
    return (nav && nav.offsetHeight) ? nav.offsetHeight : 72;
  };

  let freezeUntil = 0;
  links.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      const y = target.getBoundingClientRect().top + window.pageYOffset - navOffset();
      freezeUntil = Date.now() + 700;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActive(id);
      history.replaceState(null, '', `#${id}`);
    });
  });

  let currentId = null;
  const computeActive = () => {
    if (Date.now() < freezeUntil) return;

    const topPad = navOffset();
    const vh = window.innerHeight;
    const viewportCenter = topPad + (vh - topPad) / 2;

    let best = null;
    let bestDist = Infinity;

    for (const sec of sections) {
      const r = sec.getBoundingClientRect();
      const visible = r.bottom > topPad && r.top < vh * 0.95;
      if (!visible) continue;

      const secCenter = r.top + r.height / 2;
      const dist = Math.abs(secCenter - viewportCenter);

      if (dist < bestDist) {
        bestDist = dist;
        best = sec;
      }
    }

    if (best && best.id !== currentId) {
      currentId = best.id;
      setActive(currentId);
    }
  };

  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        computeActive();
      });
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => computeActive());
  window.addEventListener('load', () => computeActive());
  computeActive();
});

// ---- Unified totals persistence -----------------------------------
function saveSolutionTotals({ monthly, onceOff }) {
  const toNum = (v) => Number(String(v).replace(/[^\d.-]/g, '')) || 0;

  const payload = { monthly: toNum(monthly), onceOff: toNum(onceOff) };

  try { localStorage.setItem('voip:solutionTotals', JSON.stringify(payload)); } catch {}

  try { window.dispatchEvent(new Event('voip:totals')); } catch {}
}

// ---- Build → Checkout snapshot -----------------------------------
function snapshotCustomBuildFromDOM() {
  const items = [];

  document.querySelectorAll('.hardware-card').forEach(card => {
    const id    = card.dataset.id || '';
    const name  = card.dataset.name || card.querySelector('.hardware-title h2')?.textContent || '';
    const qtyEl = card.querySelector('.hardware-qty');
    const qty   = Number(qtyEl?.dataset?.qty || qtyEl?.textContent || 0) || 0;
    if (!id || !name || qty <= 0) return;

    const img   = card.querySelector('img.hardware-img');
    const src   = img?.currentSrc || img?.getAttribute('src') || '';
    const unit  = Number(card.querySelector('.price-value')?.dataset?.basePriceEx) || 0; // EX VAT
    const isBS  = card.hasAttribute('data-base-station') || isBaseStationLike(id) || isBaseStationLike(name);

    items.push({ id, name, qty, unitOnceOff: unit, image: src, isBaseStation: !!isBS });
  });

  return items;
}

function persistCustomBuild(extQtyComputed){
  const items = snapshotCustomBuildFromDOM();
  const meta  = { extQty: Number(extQtyComputed) || 0 };

  try {
    localStorage.setItem('voip:customBuild', JSON.stringify(items));
    localStorage.setItem('voip:buildMeta',  JSON.stringify(meta));
  } catch (e) {
    console.warn('Failed to persist custom build:', e);
  }
}

window.addEventListener('beforeunload', () => {
  try {
    const entries = Object.values(SH);
    const onceOff = entries.reduce((s,it)=> s + n(it.qty)*n(it.onceOffEx), 0);
    const exts    = entries.reduce((s,it)=> s + (it.isBaseStation ? 0 : n(it.qty)), 0);
    persistCustomBuild(exts);
    saveSolutionTotals({ monthly: exts > 0 ? BASE_MONTHLY + PER_EXT*exts : 0, onceOff });
  } catch {}
});


