// scripts/porting.js
(function () {
  // ---------- Elements ----------
  const statusEl      = document.getElementById('selection-status');
  const checkout      = document.getElementById('checkout-cta');
  const checkoutCard  = document.getElementById('checkout-card');

  const cardNew       = document.getElementById('card-new');
  const cardPort      = document.getElementById('card-port');
  const newSelect     = document.getElementById('new-number-input');
  const portWrap      = document.getElementById('port-numbers-container');
  const addAnotherBtn = document.getElementById('add-another-number');

  const monthlyEl     = document.getElementById('total-footer-price');
  const onceoffEl     = document.getElementById('total-onceoff');
  const periodEl      = document.getElementById('total-cost-period');

  // ---------- Utils ----------
  const fmtR   = (n) => `R ${Number(n || 0).toLocaleString('en-ZA')}`;
  const digits = (s) => String(s || '').replace(/\D/g, '');
  const isValidGeo = (d) => d.length === 10 && /^0[1-5]/.test(d); // SA geographic (01–05 + 8 digits)

  // ---------- Card selection helpers ----------
  function selectCard(cardEl){
    document.querySelectorAll('#step-2 .selectable-card').forEach(c => c.classList.remove('is-selected'));
    if (cardEl) cardEl.classList.add('is-selected');
  }
  function setMutedStates(mode) {
    if (!cardNew || !cardPort) return;
    cardNew.classList.toggle('is-muted', mode === 'port');
    cardPort.classList.toggle('is-muted', mode === 'new');
  }
  function setCheckoutHighlight(on) {
    if (!checkoutCard) return;
    checkoutCard.classList.toggle('checkout-ring', !!on);
  }
  function setCtaEnabled(on, reason) {
    if (!checkout) return;
    checkout.classList.toggle('cta-disabled', !on);
    checkout.setAttribute('aria-disabled', on ? 'false' : 'true');
    if (!on && reason) checkout.title = reason; else checkout.removeAttribute('title');
  }

function loadTotals() {
  const toNum = (v) => Number(String(v).replace(/[^\d.-]/g, '')) || 0;

  let monthly = 0, onceOff = 0;

  try {
    // Priority 1: build-solution unified key
    const solRaw = localStorage.getItem('voip:solutionTotals');
    if (solRaw) {
      const t = JSON.parse(solRaw);
      monthly = toNum(t?.monthly);
      onceOff = toNum(t?.onceOff);
    }

    // Priority 2: packages fallback (kept as-is)
    if (!monthly && !onceOff) {
      const pkgRaw = localStorage.getItem('voip:selectedPackage');
      if (pkgRaw) {
        const p = JSON.parse(pkgRaw);
        // Be tolerant to different field names
        monthly = toNum(p?.monthly ?? p?.monthlyTotal);
        onceOff = toNum(p?.onceOff ?? p?.onceOffTotal ?? p?.onceOffCost);
      }
    }

    // Optional: legacy compatibility for any old build-solution keys
    if (!monthly && !onceOff) {
      const legacy = localStorage.getItem('voip:checkoutTotals') || localStorage.getItem('voip:buildSolutionTotals');
      if (legacy) {
        const t = JSON.parse(legacy);
        monthly = toNum(t?.monthly ?? t?.monthlyTotal);
        onceOff = toNum(t?.onceOff ?? t?.onceOffTotal);
      }
    }
  } catch { /* noop */ }

  if (monthlyEl) monthlyEl.textContent = fmtR(monthly);
  if (onceoffEl) onceoffEl.textContent = fmtR(onceOff);
  if (periodEl)  periodEl.textContent  = '/mo.';
}

  // Initial totals paint
  loadTotals();

  // Live updates from other tabs or same-tab events
  window.addEventListener('storage', (e) => {
    if (e.key === 'voip:solutionTotals' || e.key === 'voip:selectedPackage') loadTotals();
  });
  window.addEventListener('voip:totals', loadTotals);

  // ---------- Selection + Validation ----------
  let selectedMode = null; // 'new' | 'port' | null

  function validNewNumber() {
    return !!(newSelect && newSelect.value !== '0');
  }
  function validPorting() {
    const inputs = portWrap?.querySelectorAll('input[name="port-number-input"]') || [];
    for (const input of inputs) {
      const d = digits(input.value);
      if (isValidGeo(d)) return true;
    }
    return false;
  }

  function updateStatusLine() {
    if (!statusEl) return;
    if (selectedMode === 'new') {
      if (validNewNumber()) {
        const label = newSelect.options[newSelect.selectedIndex]?.textContent?.trim() || 'selected region';
        statusEl.innerHTML = `✅ <span class="status-ok">Number selected:</span> ${label}. Proceed to <strong>Checkout</strong>.`;
      } else {
        statusEl.innerHTML = `ℹ️ <span class="status-warn">Choose a region</span> to select your new number.`;
      }
    } else if (selectedMode === 'port') {
      if (validPorting()) {
        statusEl.innerHTML = `✅ <span class="status-ok">Porting number captured.</span> Proceed to <strong>Checkout</strong>.`;
      } else {
        statusEl.innerHTML = `⚠️ <span class="status-warn">Enter at least one valid 10-digit geographic number</span> to continue.`;
      }
    } else {
      statusEl.textContent = '';
    }
  }

  function updateCheckoutState() {
    let ok = false;
    if (selectedMode === 'new')  ok = validNewNumber();
    if (selectedMode === 'port') ok = validPorting();

    setCtaEnabled(ok, selectedMode === 'port'
      ? 'Enter a valid 10-digit geographic number to continue'
      : 'Pick a region to continue');

    setCheckoutHighlight(ok);
    updateStatusLine();
  }

  // Expose for your HTML onclick handlers
  window.virtualNumberBtn = function (mode) {
    selectedMode = Number(mode) === 1 ? 'port' : 'new';
    selectCard(selectedMode === 'new' ? cardNew : cardPort);
    setMutedStates(selectedMode);
    updateCheckoutState();
  };

  // ---------- Porting input builders + validation wiring ----------
  function attachValidation(input){
    const paint = () => {
      // Typing in porting implies 'port' mode
      if (selectedMode !== 'port') {
        selectedMode = 'port';
        selectCard(cardPort);
        setMutedStates(selectedMode);
      }
      const ok = isValidGeo(digits(input.value));
      input.style.outline = ok ? '2px solid rgba(34,197,94,.45)' : 'none';
      updateCheckoutState();
      savePortSelection(); // keep storage in sync as user types
    };
    input.addEventListener('input', paint);
    input.addEventListener('focus', paint);
    input.addEventListener('change', paint);
  }

  function createPortNumberInput(){
    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'port-number-input';
    input.placeholder = 'Enter your number (e.g. 0211234567)';
    input.pattern = '0[1-5]\\d{8}';
    input.maxLength = 16; // allow spaces/dashes; we strip them in JS
    input.title = 'Enter a valid SA geographical number';
    input.required = true;
    input.inputMode = 'numeric';
    input.className = 'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-[#0071E3] transition';
    attachValidation(input);
    return input;
  }

  // Initial porting input wiring
  const firstInput = portWrap?.querySelector('input[name="port-number-input"]');
  if (firstInput) attachValidation(firstInput);

  // Add-another handler (max 3)
  addAnotherBtn?.addEventListener('click', () => {
    const inputs = portWrap?.querySelectorAll('input[name="port-number-input"]') || [];
    if (inputs.length >= 3) { alert('Maximum 3 numbers allowed'); return; }
    portWrap.appendChild(createPortNumberInput());
  });

  // Wire up New Number select (changes imply "new")
  newSelect?.addEventListener('change', () => {
    selectedMode = 'new';
    selectCard(cardNew);
    setMutedStates(selectedMode);
    updateCheckoutState();
    saveNewSelection(); // persist selection
  });

  // ---------- Persist selection to localStorage ----------
  function saveNewSelection() {
    if (!newSelect) return;
    const code = newSelect.value;
    if (code && code !== '0') {
      const label = newSelect.options[newSelect.selectedIndex]?.textContent?.trim() || '';
      const payload = { mode: 'new', regionCode: code, region: label, numbers: [] };
      try { localStorage.setItem('voip:virtualNumber', JSON.stringify(payload)); } catch {}
    } else {
      try { localStorage.removeItem('voip:virtualNumber'); } catch {}
    }
  }

  function savePortSelection() {
    if (!portWrap) return;
    const inputs = Array.from(portWrap.querySelectorAll('input[name="port-number-input"]'));
    const nums = inputs.map(i => digits(i.value)).filter(isValidGeo);
    if (nums.length > 0) {
      const unique = Array.from(new Set(nums));
      const payload = { mode: 'port', numbers: unique };
      try { localStorage.setItem('voip:virtualNumber', JSON.stringify(payload)); } catch {}
    } else {
      try { localStorage.removeItem('voip:virtualNumber'); } catch {}
    }
  }

  // On load, capture whatever is already selected/typed (back/forward nav)
  saveNewSelection();
  savePortSelection();

  // If user adds another field, hook storage saving for the new one too
  addAnotherBtn?.addEventListener('click', () => {
    setTimeout(() => {
      const last = portWrap?.querySelector('input[name="port-number-input"]:last-of-type');
      if (last) {
        // attachValidation already saves on input/change
        // but we also ensure savePortSelection runs on blur
        last.addEventListener('blur', savePortSelection);
      }
    }, 0);
  });

  // ---------- Checkout protection ----------
  checkout?.addEventListener('click', (e) => {
    if (checkout.classList.contains('cta-disabled')) {
      e.preventDefault();
      const target = selectedMode === 'port' ? cardPort : cardNew;
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      statusEl?.classList.remove('shake'); void statusEl?.offsetWidth; statusEl?.classList.add('shake');
    }
  });

  // ---------- Initial UI state ----------
  setCtaEnabled(false);
  setCheckoutHighlight(false);
  setMutedStates(selectedMode);
  (function primeStatus(){ updateStatusLine(); })();
})();
