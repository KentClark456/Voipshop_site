// docs/scripts/checkout.js
(function () {
  'use strict';

  // ---- Single Source of Truth for Pricing ----
  window.PRICE_CATALOG = {
    "YEALINK_T31P": { name: "Yealink T31P", unit_price: 110000 },   // R1100.00
    "YEALINK_T33G": { name: "Yealink T33G", unit_price: 145000 },   // R1450.00
    "YEALINK_T73U": { name: "Yealink T73U", unit_price: 199500 },   // R1995.00
    "YEALINK_T74U": { name: "Yealink T74U", unit_price: 299500 },   // R2995.00
    "YEALINK_T77U": { name: "Yealink T77U", unit_price: 399500 },   // R3995.00
    "YEALINK_W73P": { name: "Yealink W73P (Base + Handset)", unit_price: 225000 }, // R2250.00
    "YEALINK_W73H": { name: "Yealink W73H (Extra Handset)", unit_price: 130000 },  // R1300.00
    "YEALINK_W70B": { name: "Yealink W70B Base Station", unit_price: 93000 },      // R930.00
    "YEALINK_W59R": { name: "Yealink W59R (Rugged Handset)", unit_price: 245000 }, // R2450.00
    "YEALINK_T31W": { name: "Yealink T31W (Wi-Fi)", unit_price: 125000 },          // R1250.00
    "YEALINK_AX83H": { name: "Yealink AX83H", unit_price: 220000 }                 // R2200.00
  };

  // ---------- Image catalog (SKU or Name -> asset path) ----------
  window.IMAGE_CATALOG = {
    // T31 series (shared image)
    "YEALINK_T31P": "Assets/Untitled design-13.png",
    "Yealink T31P": "Assets/Untitled design-13.png",

    "YEALINK_T31W": "Assets/Untitled design-13.png",
    "Yealink T31W": "Assets/Untitled design-13.png",
    "Yealink T31W (Wi-Fi)": "Assets/Untitled design-13.png",

    // T33G
    "YEALINK_T33G": "Assets/Untitled design-33.png",
    "Yealink T33G": "Assets/Untitled design-33.png",

    // T73U
    "YEALINK_T73U": "Assets/Untitled design-4.png",
    "Yealink T73U": "Assets/Untitled design-4.png",

    // T74U (note: your file is named 73U.png — using as provided)
    "YEALINK_T74U": "Assets/73U.png",
    "Yealink T74U": "Assets/73U.png",

    // T77U
    "YEALINK_T77U": "Assets/77U.png",
    "Yealink T77U": "Assets/77U.png",

    // W73P / W73H / W70B / W59R
    "YEALINK_W73P": "Assets/Untitled (1080 x 1080 px)-3.png",
    "Yealink W73P": "Assets/Untitled (1080 x 1080 px)-3.png",
    "Yealink W73P (Base + Handset)": "Assets/Untitled (1080 x 1080 px)-3.png",

    "YEALINK_W73H": "Assets/Untitled (1080 x 1080 px)-6.png",
    "Yealink W73H": "Assets/Untitled (1080 x 1080 px)-6.png",
    "Yealink W73H (Extra Handset)": "Assets/Untitled (1080 x 1080 px)-6.png",

    "YEALINK_W70B": "Assets/Untitled design-12.png",
    "Yealink W70B": "Assets/Untitled design-12.png",
    "Yealink W70B Base Station": "Assets/Untitled design-12.png",

    "YEALINK_W59R": "Assets/Untitled design-10.png",
    "Yealink W59R": "Assets/Untitled design-10.png",
    "Yealink W59R (Rugged Handset)": "Assets/Untitled design-10.png",

    // AX83H
    "YEALINK_AX83H": "Assets/Untitled (1080 x 1080 px)-7.png",
    "Yealink AX83H": "Assets/Untitled (1080 x 1080 px)-7.png",

    // Mobile app / phone
    "MOBILE_APP": "Assets/Untitled design-11.png",
    "Mobile App": "Assets/Untitled design-11.png"
  };

  // Helper: resolve by SKU or by pretty name, with safe fallback
  function getImage(idOrName = '') {
    const key = String(idOrName).trim();
    if (!key) return 'Assets/placeholder-device.png';
    if (window.IMAGE_CATALOG[key]) return window.IMAGE_CATALOG[key];

    // Soft match (case/whitespace-insensitive)
    const norm = s => s.toLowerCase().replace(/\s+/g, '');
    const target = norm(key);
    for (const [k, v] of Object.entries(window.IMAGE_CATALOG)) {
      if (norm(k) === target) return v;
    }
    return 'Assets/placeholder-device.png';
  }

  // ---------- Pricing helpers (use PRICE_CATALOG only) ----------
  const _CAT = window.PRICE_CATALOG || {};
  const _INDEX_BY_NAME = {}; // exact, lowercase name -> sku
  const _INDEX_BY_NORM = {}; // normalized (a-z0-9 only) name -> sku

  function _norm(s=''){ return String(s).toLowerCase().replace(/[^a-z0-9]/g, ''); }

  for (const [sku, rec] of Object.entries(_CAT)) {
    const name = rec?.name || '';
    _INDEX_BY_NAME[name.trim().toLowerCase()] = sku;
    _INDEX_BY_NORM[_norm(name)] = sku;
    _INDEX_BY_NORM[_norm(sku)]  = sku; // also index the sku itself
  }

  function centsToRands(cents){ return Math.round(Number(cents || 0) / 100); }

  function getPriceFromCatalog(nameOrSku){
    if (!nameOrSku) return null;
    const raw = String(nameOrSku).trim();

    // 1) Direct SKU
    if (_CAT[raw]?.unit_price != null) return centsToRands(_CAT[raw].unit_price);

    // 2) Exact name (case-insensitive)
    const byExactNameSku = _INDEX_BY_NAME[raw.toLowerCase()];
    if (byExactNameSku && _CAT[byExactNameSku]?.unit_price != null) {
      return centsToRands(_CAT[byExactNameSku].unit_price);
    }

    // 3) Normalized name (remove spaces, parentheses, +, etc.)
    const norm = _norm(raw);
    const byNormSku = _INDEX_BY_NORM[norm];
    if (byNormSku && _CAT[byNormSku]?.unit_price != null) {
      return centsToRands(_CAT[byNormSku].unit_price);
    }

    return null; // not found -> caller will treat as 0 (included)
  }

  // Provide the getters your code expects
  function getPrice(name){
    const p = getPriceFromCatalog(name);
    return p != null ? p : 0; // fallback to 0 so UI still renders
  }
  function getItem(){ return null; } // image isn’t coming from catalog here

  // Keep/restore guessImage helper (not required, but kept if other code uses it)
  function guessImage(name = ''){
    const s = String(name);
    return /t31w/i.test(s) ? 'Assets/t31w.jpeg'
         : /w73p|w73h/i.test(s) ? 'Assets/cordless.png'
         : /mobile/i.test(s) ? 'Assets/mobile-app.png'
         : '';
  }

  // ---------- Billing config ----------
  const BILLING = {
    monthly: {
      platformFee: 150,      // R
      extension: 65,         // R per extension
      virtualNumber: 25      // R per number hosted
    },
    rates: {
      localPerMin: 0.35,
      mobilePerMin: 0.55
    }
  };

  // ---------- Local helpers ----------
  const fmtR    = (n, perMonth=false) => 'R ' + Number(n||0).toLocaleString('en-ZA') + (perMonth ? ' /mo' : '');
  const fmtZAR  = (n) => 'R' + Number(n||0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const safeParse  = (s) => { try { return JSON.parse(s || 'null'); } catch { return null; } };
  const escapeHtml = (s) => String(s||'').replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const isBaseStationLike = (s='') => /w70b|base\s*station|dect\s*base/i.test(String(s));
  const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

  // ---------- Inputs from storage ----------
  const selected  = safeParse(localStorage.getItem('voip:selectedPackage')) || {};
  const custom    = safeParse(localStorage.getItem('voip:customBuild')) || [];
  const buildMeta = safeParse(localStorage.getItem('voip:buildMeta')) || {};
  const vnum      = safeParse(localStorage.getItem('voip:virtualNumber')) || null;

  const hasCustom = Array.isArray(custom) && custom.length > 0;
  const usePackageDevices = !hasCustom && Array.isArray(selected.devices) && selected.devices.length > 0;

  // Flags (package-derived; meta can override)
  const WIRELESS_KEYWORDS = /wireless|wi-?fi|wifi|mesh|access\s*point|(?:\b|_)ap\b|router|deco|tp[-\s]?link|ubiquiti|unifi/i;
  function isWirelessSelected(sel={}){
    if (sel.isWireless === true) return true;
    if (typeof sel.category === 'string' && /wireless/i.test(sel.category)) return true;
    if (Array.isArray(sel.tags) && sel.tags.some(t => /wireless/i.test(String(t)))) return true;
    if (Array.isArray(sel.devices)) {
      return sel.devices.some(d => WIRELESS_KEYWORDS.test(String(d.device || d.name || '')));
    }
    return false;
  }
  let wirelessMode = isWirelessSelected(selected);
  if (typeof buildMeta.wireless === 'boolean') wirelessMode = !!buildMeta.wireless;

  let isVoiceOnly =
    selected?.isVoiceOnly === true ||
    /voice\s*only/i.test(String(selected?.category||'')) ||
    (Array.isArray(selected?.tags) && selected.tags.some(t => /voice\s*only/i.test(String(t))));
  if (typeof buildMeta.isVoiceOnly === 'boolean') isVoiceOnly = !!buildMeta.isVoiceOnly;

  // Extension count
  function countExtensionsFromPackage(sel={}){
    const explicit = Number(sel.extensions || sel.ext || sel.numExtensions || sel.lines || 0);
    if (explicit) return explicit;
    let count = 0;
    if (Array.isArray(sel.devices)) {
      sel.devices.forEach(d => {
        const name = (d.device || d.name || '').trim();
        const qty  = Number(d.number) || 0;
        if (!name || !qty) return;
        if (isBaseStationLike(name)) return;
        count += qty;
      });
    }
    return count || 1;
  }
  function countExtensionsFromCustom(items=[]){
    return (Array.isArray(items) ? items : []).reduce((s,it)=> s + (it.isBaseStation ? 0 : Number(it.qty||0)), 0) || 1;
  }
  let extQty = hasCustom ? countExtensionsFromCustom(custom) : countExtensionsFromPackage(selected);
  if (Number(buildMeta.extQty) > 0) extQty = Number(buildMeta.extQty);

  // Monthly fees (BILLING)
  const PLATFORM_FEE     = BILLING.monthly.platformFee;
  const EXT_FEE          = BILLING.monthly.extension;
  const DEFAULT_VN_PRICE = BILLING.monthly.virtualNumber;

  const onceItems = [];
  const monthlyItems = [];

  // ---------- Once-off: PACKAGE devices (only if no custom) ----------
  if (usePackageDevices) {
    const counts = {};
    selected.devices.forEach(d => {
      const name = d.device || d.name;
      const qty  = Number(d.number)||0;
      if (!name || !qty) return;
      counts[name] = (counts[name] || 0) + qty;
    });

    Object.entries(counts).forEach(([name, qty]) => {
      let unit = getPrice(name);
      if (unit == null) unit = 0;
      const fromCatalogImage = getImage(name);
      onceItems.push({
        name,
        image: fromCatalogImage,
        qty,
        unitOnceOff: Math.round(Number(unit)||0),
        included: Number(unit) === 0
      });
    });
  }

  // ---------- Once-off: CUSTOM BUILD devices (preferred when present) ----------
  if (hasCustom) {
    custom.forEach(it => {
      const qty = Number(it.qty)||0;
      if (qty <= 0) return;
      const unit = Number(it.unitOnceOff)||0;     // exact unit price saved by Build
      const img  = String(it.image || '');        // exact image path saved by Build
      onceItems.push({
        name: it.name,
        image: img,
        qty,
        unitOnceOff: unit,
        included: !!it.included,
        isBaseStation: !!it.isBaseStation
      });
    });
  }

  // ---------- Freebies ----------
  if (!wirelessMode && !isVoiceOnly && extQty >= 2) {
    onceItems.push({ name: 'Network Switch', image: 'Assets/server-network.png', qty: 1, unitOnceOff: 0, included: true });
  }
  if (!wirelessMode) {
    onceItems.push({ name: 'Installation', image: 'Assets/construct2.png', qty: 1, unitOnceOff: 0, included: true });
  }

  // ---------- Monthly: platform + per-extension ----------
  monthlyItems.push({ name: 'Cloud PBX Platform', image: 'Assets/cloud2.png', qty: 1, unitMonthly: PLATFORM_FEE, included: false });
  monthlyItems.push({ name: 'Extension Fee', image: 'Assets/mingcute_transfer-vertical-line copy.png', qty: extQty, unitMonthly: EXT_FEE, included: false });

// ===================== Calls info row (bundle-aware & adjustable) =====================
const LOCAL_RATE_PER_MIN  = BILLING.rates.localPerMin;
const MOBILE_RATE_PER_MIN = BILLING.rates.mobilePerMin;
const fmtPerMin = n => 'R ' + Number(n||0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '/min';

const minutesIncluded = Number(selected?.minutesIncluded);
const bundleUnitPrice = 100;                 // R100 per 250-minute bundle
const startingQty = Number.isFinite(minutesIncluded) && minutesIncluded > 0
  ? Math.round(minutesIncluded / 250)       // 250 min => 1, 500 min => 2
  : 0;                                      // custom builds with no minutes => 0

const callsSubtext = startingQty > 0
  ? [
      `${(startingQty * 250).toLocaleString('en-ZA')} minutes included`,
      `Overages: Local ${fmtPerMin(LOCAL_RATE_PER_MIN)} · Mobile ${fmtPerMin(MOBILE_RATE_PER_MIN)}`
    ]
  : [`Local ${fmtPerMin(LOCAL_RATE_PER_MIN)} · Mobile ${fmtPerMin(MOBILE_RATE_PER_MIN)}`];

monthlyItems.push({
  name: 'Calls',
  image: 'Assets/calls2.png',
  qty: startingQty,                 // adjustable in UI
  unitMonthly: bundleUnitPrice,     // always show R100 /mo per bundle
  included: false,
  adjustable: true,                 // tell renderer this row can change
  isCalls: true,                    // special minutes text handling
  subtext: callsSubtext
});

// ---------- Monthly: virtual number hosting (optional) ----------
if (vnum && vnum.mode === 'new') {
  const label = `Virtual Number${vnum.region ? ' — ' + vnum.region : ''}`;
  monthlyItems.push({
    name: label,
    image: 'Assets/hashtag3.png',
    qty: 1,
    unitMonthly: DEFAULT_VN_PRICE,
    included: false
  });
}

if (vnum && vnum.mode === 'port') {
  const label = `Number Hosting (Ported)${Array.isArray(vnum.numbers) && vnum.numbers[0] ? ' — ' + vnum.numbers[0] : ''}`;
  // 👇 Option 1: show row with R 0.00
  monthlyItems.push({
    name: label,
    image: 'Assets/hashtag3.png',
    qty: 1,
    unitMonthly: 0,
    included: true
  });

  // 👇 Option 2 (if you prefer to hide it completely, just comment out this push)
  // do nothing
}

// ---------- Filter out Remote Provisioning unless voice-only ----------
const RP = /remote\s*provision/i;
const onceToRender  = onceItems.filter(it => isVoiceOnly || !RP.test(String(it?.name || '')));
const monthToRender = monthlyItems.filter(it => isVoiceOnly || !RP.test(String(it?.name || '')));

// ---------- Render ----------
const onceWrap  = document.getElementById('onceoff-rows');
const monthWrap = document.getElementById('monthly-rows');

function renderHeader(container) {
  const head = document.createElement('div');
  head.className = 'hidden md:grid grid-cols-12 text-xs text-gray-500 uppercase tracking-wide table-head px-4 py-3 rounded-xl';
  head.innerHTML = `
    <div class="col-span-6 md:col-span-6">Products</div>
    <div class="col-span-2">Price</div>
    <div class="col-span-2">Quantity</div>
    <div class="col-span-2">Total</div>
  `;
  container.appendChild(head);
}

// row factory (adds dataset for dynamic totals + qty controls)
function renderRow({
  section,                    // 'once' | 'month'
  name, image,
  unit = 0,                   // numeric unit price (R)
  qty  = 1,                   // numeric qty
  included = false,
  adjustable = false,         // show +/- ?
  isCalls = false,            // special subtext updates
  subtext = null
}) {
  const isMonthly = section === 'month';
  const priceText = included
    ? 'Included'
    : (unit > 0
        ? (isMonthly ? `R ${unit.toLocaleString('en-ZA')} /mo`
                     : `R ${unit.toLocaleString('en-ZA')}`)
        : 'R 0');

  const total     = included ? 0 : (unit * qty);
  const totalText = included
    ? 'Included'
    : (isMonthly ? `R ${total.toLocaleString('en-ZA')} /mo`
                 : `R ${total.toLocaleString('en-ZA')}`);

  const row = document.createElement('div');
  row.className = 'grid grid-cols-12 items-center gap-3 p-4 table-row';

  // store metadata for live updates
  row.dataset.section    = section;
  row.dataset.name       = name;
  row.dataset.unit       = String(Number(unit)||0);
  row.dataset.qty        = String(Number(qty)||0);
  row.dataset.adjustable = adjustable ? '1' : '0';
  row.dataset.calls      = isCalls ? '1' : '0';
  row.dataset.amount     = String(total); // used by recalcEverything()

  // NEW: stable attributes for payload builder
  row.setAttribute('data-item', '');
  row.setAttribute('data-name', name);
  row.setAttribute('data-qty', String(Number(qty) || 0));
  row.setAttribute('data-total', String(total));

  // qty cell: controls or plain text
  const qtyCell = adjustable && !included
    ? `
      <div class="qty-pill">
        <button type="button" class="qty-btn" data-qty-btn data-delta="-1" aria-label="Decrease">−</button>
        <span class="qty-value js-qty">${qty}</span>
        <button type="button" class="qty-btn" data-qty-btn data-delta="1" aria-label="Increase">+</button>
      </div>`
    : `<span class="qty-plain">${included ? '1' : String(qty)}</span>`;

  row.innerHTML = `
    <div class="col-span-12 md:col-span-6 flex items-center gap-3">
      ${image
        ? `<img src="${image}" alt="${escapeHtml(name)}" class="w-12 h-12 rounded-xl object-contain bg-white">`
        : `<div class="w-12 h-12 rounded-xl bg-white grid place-items-center text-gray-400 text-xs">#</div>`}
      <div>
        <div class="font-medium text-gray-900">${escapeHtml(name)}</div>
        ${subtext ? `<div class="text-xs text-gray-500 mt-0.5 js-subtext">${
                      Array.isArray(subtext)
                        ? subtext.map(s => escapeHtml(s)).join('<br>')
                        : escapeHtml(subtext)
                    }</div>` : ''}
      </div>
    </div>
    <div class="col-span-6 md:col-span-2 ${included ? 'text-gray-500':'text-gray-800'}" data-cell="price">${priceText}</div>
    <div class="col-span-6 md:col-span-2 ${included ? 'text-gray-500':''}" data-cell="qty">
      ${qtyCell}
    </div>
    <div class="col-span-6 md:col-span-2 ${included ? 'text-gray-500':'font-medium text-gray-900'}" data-cell="total">${totalText}</div>
  `;
  return row;
}


/* --- UPDATED HELPERS: Apple-ish calls chip + minus disabling --- */
function decorateCallsRow(row){
  if (!row || row.dataset.calls !== '1') return;

  const qty = Number(row.dataset.qty || 0);
  const minutes = qty * 250;
  const sub = row.querySelector('.js-subtext');
  if (!sub) return;

  if (qty > 0) {
    // Show minutes bundle + overage rates (no monthly cost chip)
    sub.innerHTML = `
      <span class="chip chip-primary">${minutes.toLocaleString('en-ZA')} minutes</span>
      <div class="text-xs text-gray-500 mt-1">
        Overages: Local ${fmtPerMin(LOCAL_RATE_PER_MIN)} · Mobile ${fmtPerMin(MOBILE_RATE_PER_MIN)}
      </div>`;
  } else {
    // Pay-as-you-go + per-minute rates
    sub.innerHTML = `
      <span class="chip chip-ghost">Pay-as-you-go</span>
      <div class="text-xs text-gray-500 mt-1">
        Local ${fmtPerMin(LOCAL_RATE_PER_MIN)} · Mobile ${fmtPerMin(MOBILE_RATE_PER_MIN)}
      </div>`;
  }
}

function syncQtyButtons(row, minQty){
  const minus = row.querySelector('[data-qty-btn][data-delta="-1"]');
  if (minus) minus.disabled = (Number(row.dataset.qty || 0) <= minQty);
}


// render lists
if (onceWrap) {
  onceWrap.innerHTML = '';
  renderHeader(onceWrap);
  onceToRender.forEach(it => {
    const included = it.included || it.unitOnceOff === 0;
    const qty   = included ? 1 : Number(it.qty || 1);
    const unit  = included ? 0 : Number(it.unitOnceOff || 0);
    const rowEl = renderRow({
      section: 'once',
      name: it.name,
      image: it.image,
      unit, qty,
      included,
      adjustable: !included   // make freebies non-adjustable
    });
    onceWrap.appendChild(rowEl);
  });
}

if (monthWrap) {
  monthWrap.innerHTML = '';
  renderHeader(monthWrap);
  monthToRender.forEach(it => {
    // Identify the special rows
    const isPlatform = /cloud pbx platform/i.test(String(it.name || ''));
    const isCallsRow = !!it.isCalls || /^\s*calls\s*$/i.test(String(it.name || ''));

    const included = it.included || it.unitMonthly === 0;

    // Unit logic: calls = R100 per 250-min bundle (even if initial bundle qty is 0)
    const unit = included ? 0 : (isCallsRow ? 100 : Number(it.unitMonthly || 0));

    // Initial qty: calls reflect selected.minutesIncluded; others use provided qty or 1
    const initialMinutes = Number(selected?.minutesIncluded || 0);
    const qty = included
      ? 1
      : (isCallsRow ? Math.max(0, Math.round(initialMinutes / 250)) : Number(it.qty || 1));

    const rowEl = renderRow({
      section: 'month',
      name: it.name,
      image: it.image,
      unit, qty,
      included,
      adjustable: !included && !isPlatform,  // everything adjustable except Platform (and freebies)
      isCalls: isCallsRow,
      subtext: it.subtext
    });

    monthWrap.appendChild(rowEl);

    // Initialize minus disabling & calls chip
    if (rowEl.dataset.adjustable === '1') {
      const minQty = rowEl.dataset.calls === '1' ? 0 : 1;
      syncQtyButtons(rowEl, minQty);
    }
    if (rowEl.dataset.calls === '1') {
      decorateCallsRow(rowEl);
    }
  });
}

// ---------- Quantity handlers (event delegation) ----------
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-qty-btn]');
  if (!btn) return;
  const row = btn.closest('.table-row');
  if (!row || row.dataset.adjustable !== '1') return;

  const isCalls  = row.dataset.calls === '1';
  const section  = row.dataset.section;      // 'once' | 'month'
  const unit     = Number(row.dataset.unit || 0);
  let qty        = Number(row.dataset.qty  || 0);

  const delta = Number(btn.dataset.delta || 0);

  // min qty rules: calls can go to 0; others min 1
  const minQty = isCalls ? 0 : 1;
  qty = Math.max(minQty, qty + delta);

  // persist (dataset)
  row.dataset.qty = String(qty);
  const amount    = unit * qty;
  row.dataset.amount = String(amount);

  // NEW: keep stable attributes in sync for the payload collector
  row.setAttribute('data-qty', String(qty));
  row.setAttribute('data-total', String(amount));

  // update quantity display
  const qtySpan = row.querySelector('.js-qty');
  if (qtySpan) qtySpan.textContent = String(qty);

  // update total cell
  const totalCell = row.querySelector('[data-cell="total"]');
  if (totalCell) {
    const text = section === 'month'
      ? `R ${amount.toLocaleString('en-ZA')} /mo`
      : `R ${amount.toLocaleString('en-ZA')}`;
    totalCell.textContent = text;
  }

  // update Calls subtext (minutes chips)
  if (isCalls) {
    decorateCallsRow(row);
  }

  // re-sum everything + refresh button disabling
  recalcEverything();
  syncQtyButtons(row, minQty);
});


// ---------- Summaries & footers ----------
function sumSectionAmounts(selector){
  return Array.from(document.querySelectorAll(`${selector} .table-row`))
    .reduce((s, r) => s + (Number(r.dataset.amount) || 0), 0);
}
function updateRightSummary(onceSum, monthSum){
  const VAT_RATE = 0.15;
  const fmtZAR = n => 'R' + Number(n||0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  setText('subtotal-onceoff', fmtZAR(onceSum));
  setText('subtotal-monthly', fmtZAR(monthSum));
  const vatFirst = Math.round(((onceSum + monthSum) * VAT_RATE) * 100) / 100;
  setText('vat-first-month', fmtZAR(vatFirst));
  setText('total-first-month', fmtZAR(onceSum + monthSum + vatFirst));
}
function updateTableFooters(onceSum, monthSum){
  const fmtFooter = v => 'R ' + Math.round(Number(v||0)).toLocaleString('en-ZA');
  const onceOut  = document.getElementById('onceoff-total');
  const monthOut = document.getElementById('monthly-total');
  if (onceOut)  onceOut.textContent = fmtFooter(onceSum);
  if (monthOut) monthOut.innerHTML  = fmtFooter(monthSum) + '<span class="text-gray-500 text-xs">/month</span>';
}
function recalcEverything(){
  const once  = sumSectionAmounts('#onceoff-rows');
  const month = sumSectionAmounts('#monthly-rows');
  updateRightSummary(once, month);
  updateTableFooters(once, month);
}

// initial totals
recalcEverything();

// Keep footers in sync if rows change dynamically by other scripts
const mo = new MutationObserver(recalcEverything);
['onceoff-rows','monthly-rows'].forEach(id=>{
  const el = document.getElementById(id);
  if (el) mo.observe(el, { childList: true, subtree: true, characterData: true });
});
window.recalcCartTotals = recalcEverything;

// ---------- Clear Cart ----------
(function injectClearCart(){
  const summaryCard = document.querySelector('aside .bg-white.rounded-2xl.shadow-sm.border.p-5');
  if (!summaryCard) return;
  if (!document.getElementById('clear-cart')) {
    const btn = document.createElement('button');
    btn.id = 'clear-cart';
    btn.type = 'button';
    btn.textContent = 'Clear Cart';
    btn.className = 'mt-4 w-full rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2';
    summaryCard.appendChild(btn);
    btn.addEventListener('click', () => {
      ['voip:selectedPackage','voip:customBuild','voip:virtualNumber','voip:buildMeta'].forEach(k => localStorage.removeItem(k));
      location.reload();
    });
  }
})();

// ---------- Checkout completion ----------
document.getElementById('quick-checkout-form')?.addEventListener('submit', (e) => {
  if (e.target.checkValidity ? e.target.checkValidity() : true) {
    e.preventDefault();
    window.location.href = 'post-checkout.html';
  } else {
    e.preventDefault();
    e.target.reportValidity && e.target.reportValidity();
  }
});

})(); // closes the IIFE
// === Email Quote (PDFKit attach) — drop-in ===
// Collects once-off + monthly rows, builds payload with {name, qty, unit},
// posts to /api/send-quote (which will generate + ATTACH the PDF via Resend).

if (!window.__EMAIL_QUOTE_WIRED__) {
  window.__EMAIL_QUOTE_WIRED__ = true;

  // 1) Config
  const API_BASE = 'https://voipshop-quote-api.vercel.app'; // keep if you deploy the API separately
  const SEND_QUOTE_URL = `${API_BASE}/api/send-quote`;
  const DEFAULT_VAT = 0.15; // only relevant if you need checks client-side

  // 2) Helpers
  function text(el){ return (el?.textContent || '').trim(); }
  function num(v){ const n = Number(v); return Number.isFinite(n) ? n : 0; }
  function makeQuoteNumber(){
    const d = new Date(); const pad = (n)=>String(n).padStart(2,'0');
    return `VOIP-${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}-${Math.floor(Math.random()*9e5+1e5)}`;
  }
  function parseZAR(str){
    // Accepts "R 1 234,56", "R1,234.56", "1,234.56 /mo", "R1 234,56"
    let s = String(str||'')
      .replace(/\u00A0/g,' ')     // nbsp
      .replace(/\/mo.*$/i,'')     // strip "/mo..."
      .replace(/[^\d.,-]/g,'');   // keep digits and separators
    // If both , and . appear, assume dot is decimal if it appears after last comma; otherwise swap
    const hasComma = s.includes(',');
    const hasDot = s.includes('.');
    if (hasComma && hasDot) {
      // normalize thousands then decimal
      const lastComma = s.lastIndexOf(',');
      const lastDot = s.lastIndexOf('.');
      if (lastDot > lastComma) { // 1,234.56
        s = s.replace(/,/g,'');
      } else {                   // 1.234,56
        s = s.replace(/\./g,'').replace(',', '.');
      }
    } else if (hasComma && !hasDot) {
      s = s.replace(/\./g,'').replace(',', '.'); // 1.234,56 OR 1 234,56 -> 1234.56
    } else {
      s = s.replace(/,/g,''); // 1,234.56 -> 1234.56 or 1,234 -> 1234
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  // 3) Collect line items from a container (expects either data-* or fallback scrape)
  function collectItems(containerId){
    const items = [];
    const root = document.getElementById(containerId);
    if (!root) return items;

    // Preferred: rows with data attributes
    root.querySelectorAll('[data-item]').forEach((row)=>{
      const name  = row.getAttribute('data-name') || text(row.querySelector('[data-cell="name"]')) || 'Item';
      const qty   = num(row.getAttribute('data-qty') || row.querySelector('[data-cell="qty"]')?.dataset?.qty || text(row.querySelector('[data-cell="qty"]')) || 1);
      const unitA = row.getAttribute('data-unit'); // ex VAT per unit (if you set it)
      const totalA= row.getAttribute('data-total') || text(row.querySelector('[data-cell="total"]'));
      const unit  = unitA != null ? num(unitA) : (parseZAR(totalA) / Math.max(qty,1));
      items.push({ name, qty, unit: Math.max(0, unit) });
    });

    // Fallback: scrape simple rows
    if (items.length === 0) {
      root.querySelectorAll('.table-row').forEach((row)=>{
        const nameCell  = row.querySelector('[data-cell="name"], .name') || row;
        const qtyCell   = row.querySelector('[data-cell="qty"]');
        const totalCell = row.querySelector('[data-cell="total"], .amount');
        const nameTxt   = text(nameCell);
        const qtyMatch  = nameTxt.match(/\bx\s?(\d+)\b/i) || text(qtyCell).match(/\d+/);
        const qty       = qtyMatch ? num(qtyMatch[1] || qtyMatch[0]) : 1;
        const total     = parseZAR(text(totalCell));
        const unit      = total / Math.max(qty,1);
        if (nameTxt || total) items.push({ name: nameTxt || 'Item', qty, unit: Math.max(0, unit) });
      });
    }

    return items;
  }

  // 4) Build payload for API (expects ex-VAT subtotals and per-item unit price ex-VAT)
  function buildQuotePayload(){
    const businessName = document.querySelector('input[name="businessName"]')?.value?.trim() || '';
    const email        = document.querySelector('input[name="email"]')?.value?.trim() || '';
    const phone        = document.querySelector('input[name="phone"]')?.value?.trim() || '';
    const companyName  = document.querySelector('input[name="company"]')?.value?.trim() || '';
    const address      = document.querySelector('input[name="address"]')?.value?.trim() || '';

    const itemsOnceOffRaw = collectItems('onceoff-rows');
    const itemsMonthlyRaw = collectItems('monthly-rows');

    // If your DOM totals are ex-VAT, this is perfect. If they’re inc-VAT, divide by (1+VAT).
    const onceOffSubtotalExVAT = parseZAR(document.getElementById('subtotal-onceoff')?.textContent);
    const monthlySubtotalExVAT = parseZAR(document.getElementById('subtotal-monthly')?.textContent);

    // Ensure we’re sending {name, qty, unit} to the API
    const itemsOnceOff  = itemsOnceOffRaw.map(i => ({ name: i.name, qty: i.qty, unit: num(i.unit) }));
    const itemsMonthly  = itemsMonthlyRaw.map(i => ({ name: i.name, qty: i.qty, unit: num(i.unit) }));

    return {
      delivery: 'attach', // fastest path: attach PDF via Resend
      quoteNumber: makeQuoteNumber(),
      dateISO: new Date().toISOString(),
      client: { name: businessName || email, email, phone, company: companyName, address },
      itemsOnceOff,
      itemsMonthly,
      subtotals: { onceOff: onceOffSubtotalExVAT, monthly: monthlySubtotalExVAT },
      notes: 'Generated from VoIP Shop cart.',
      // Optional: override branding, VAT, etc.
      // company: { logoUrl: 'https://voipshop.co.za/Assets/yourlogo.png', vatRate: 0.15, validityDays: 7 }
    };
  }

  async function postJSON(url, body, timeoutMs = 15000){
    const ctrl = new AbortController();
    const t = setTimeout(()=>ctrl.abort(), timeoutMs);
    try{
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal
      });
      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json() : await res.text();
      if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
      return data || { ok: true };
    } finally { clearTimeout(t); }
  }

  // 5) Bind button
  function bindEmailQuote(){
    const btn = document.getElementById('email-quote-btn');
    if (!btn || btn.__bound) return;
    btn.__bound = true;

    btn.addEventListener('click', async ()=>{
      const email = document.querySelector('input[name="email"]')?.value?.trim();
      if (!email || !/.+@.+\..+/.test(email)) { alert('Please enter a valid email.'); return; }

      if (btn.__sending) return;
      btn.__sending = true;
      const orig = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending…';

      try{
        const payload = buildQuotePayload();
        const resp = await postJSON(SEND_QUOTE_URL, payload, 20000);
        alert('Quote sent successfully.');
        console.log('[EmailQuote] OK:', resp);
      }catch(err){
        console.error('[EmailQuote] Error:', err);
        alert('Failed to send quote: ' + (err.message||err));
      }finally{
        btn.disabled = false; btn.textContent = orig; btn.__sending = false;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEmailQuote);
  } else {
    bindEmailQuote();
  }
}
