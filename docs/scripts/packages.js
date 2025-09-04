// ==================== packages.js (plural-first) ====================

// -------- Helpers for rows (plural-first; singular fallback last) --------
function getRow(key) {
  // Prefer data attribute, then plural ID, then legacy singular ID
  return (
    document.querySelector(`[data-packages-row="${key}"]`) ||
    document.getElementById(`row-${key}-extensions`) ||
    document.getElementById(`row-${key}-extension`)
  );
}

// Expose a stable map you can use in your render code elsewhere
const rows = {
  1: () => getRow(1),
  2: () => getRow(2),
  3: () => getRow(3),
  wireless: () => getRow('wireless')
};

// -------------------- Hardware Totals --------------------
function hardwareTotals() {
  const hardwarePrice = hardwarePriceTotal();
  const totalQty = hardwareQtyTotal();
  const { costPerExtension, monthlyPlatformFee } = getCostPerExtension(totalQty);
  const isValid = totalQty > 0;

  const extensionCost = totalQty * costPerExtension;
  const virtualNumberCostElement = document.getElementById('virtual-number-cost');
  const includeVirtualNumberCost = virtualNumberCostElement && virtualNumberCostElement.style.display !== 'none';
  const virtualNumberCost = includeVirtualNumberCost ? 90 : 0;
  const firstMonthMRC = monthlyPlatformFee + extensionCost + virtualNumberCost;
  const totalUpfrontCost = hardwarePrice + firstMonthMRC;

  updateSwitchAndCable(totalQty);

  if (typeof currentTab !== "undefined" && currentTab === 0) {
    const priceEl = document.getElementById('total-footer-price');
    const periodEl = document.getElementById('total-cost-period');
    if (priceEl) priceEl.textContent = formatPrice(totalUpfrontCost);
    if (periodEl) periodEl.style.display = 'none';
    checkValidity(isValid);
  }

  const onceOffElement = document.getElementById('total-once-off-cost');
  if (onceOffElement) {
    onceOffElement.innerHTML = formatPrice(totalUpfrontCost);
  }
}

// -------------------- Update Hardware --------------------
window.updateHardware = function(event, isAdding) {
  const hardwareCard = event.target.closest('.hardware-card');
  if (!hardwareCard) return;

  const hardwareQty = hardwareCard.querySelector('.hardware-qty');
  const hardwareMinus = hardwareCard.querySelector('.hardware-minus');
  const priceValueElement = hardwareCard.querySelector('.price-value');

  let qty = parseInt(hardwareQty?.dataset.qty) || 0;
  let basePrice = parseInt(priceValueElement?.dataset.basePrice) || 0;

  qty = isAdding ? Math.min(qty + 1, 9) : Math.max(qty - 1, 0);
  let deviceSum = basePrice * qty;

  hardwareCard.classList.toggle('selected', qty > 0);
  if (hardwareQty) {
    hardwareQty.style.display = qty > 0 ? 'block' : 'none';
    hardwareQty.innerHTML = qty.toString();
    hardwareQty.dataset.qty = qty.toString();
  }
  if (hardwareMinus) hardwareMinus.style.display = qty > 0 ? 'inline-flex' : 'none';

  const titleEl = hardwareCard.querySelector('.hardware-title h2');
  const descEl  = hardwareCard.querySelector('.hardware-title h3');
  const imgEl   = hardwareCard.querySelector('.hardware-img');

  const hardwareTitle = titleEl ? titleEl.textContent : '';
  const hardwareImage = imgEl ? imgEl.src : '';
  const hardwareDescription = descEl ? descEl.textContent : '';

  if (hardwareTitle === 'Yealink W56h') {
    handleCordlessPhoneSelection(qty);
  }

  updateSelectedHardware(hardwareTitle, qty, {
    image: hardwareImage,
    title: hardwareTitle,
    description: hardwareDescription,
    price: formatPrice(deviceSum)
  });

  hardwareTotals();
  const totalQty = hardwareQtyTotal();
  updateSwitchAndCable(totalQty);
  updateOrderSummary();
};

// -------------------- Base Station Logic --------------------
function handleCordlessPhoneSelection(cordlessQty) {
  const baseStationCard  = document.getElementById('base-station-card');
  if (!baseStationCard) return;

  const baseStationQty   = baseStationCard.querySelector('.hardware-qty');
  const baseStationMinus = baseStationCard.querySelector('.hardware-minus');

  let requiredBaseStations = 0;

  if (cordlessQty > 0) {
    requiredBaseStations = Math.ceil(cordlessQty / 8);

    baseStationCard.classList.add('selected');
    if (baseStationQty) {
      baseStationQty.style.display = 'block';
      baseStationQty.innerHTML = requiredBaseStations.toString();
      baseStationQty.dataset.qty = requiredBaseStations.toString();
    }
    if (baseStationMinus) baseStationMinus.style.display = 'inline-flex';

    const priceValueElement = baseStationCard.querySelector('.price-value');
    const basePrice = parseInt(priceValueElement?.dataset.basePrice) || 0;
    const totalPrice = basePrice * requiredBaseStations;

    updateSelectedHardware('Yealink W70B', requiredBaseStations, {
      image: (baseStationCard.querySelector('.hardware-img') || {}).src || '',
      title: 'Yealink W70B',
      description: 'Base Station',
      price: formatPrice(totalPrice)
    });
  } else {
    baseStationCard.classList.remove('selected');
    if (baseStationQty) {
      baseStationQty.style.display = 'none';
      baseStationQty.innerHTML = '0';
      baseStationQty.dataset.qty = '0';
    }
    if (baseStationMinus) baseStationMinus.style.display = 'none';

    updateSelectedHardware('Yealink W70B', 0, {
      image: '',
      title: 'Yealink W70B',
      description: '',
      price: formatPrice(0)
    });
  }
}

// -------------------- Switch & Cable --------------------
function updateSwitchAndCable(totalQty) {
  const switchPorts = Math.max(2, Math.ceil(totalQty / 2) * 2);
  const cableLength = Math.max(0, totalQty * 20);

  updateSelectedHardware('Network Switch', 1, {
    image: 'Assets/s-zoom.jpg',
    title: 'Network Switch',
    description: `${switchPorts} Port POE`,
    price: 'Included'
  });

  updateSelectedHardware('Ethernet Cable', cableLength, {
    image: 'Assets/Group 1780.png',
    title: 'Ethernet Cable',
    description: 'In meters',
    price: 'Included'
  });
}

// -------------------- Totals --------------------
function hardwareQtyTotal() {
  const hardwareItems = document.querySelectorAll('.hardware-card');
  let totalQty = 0;
  hardwareItems.forEach(item => {
    const qtyEl = item.querySelector('.hardware-qty');
    const qty = parseInt(qtyEl?.dataset.qty) || 0;
    totalQty += qty;
  });
  return totalQty;
}

function hardwarePriceTotal() {
  const hardwareItems = document.querySelectorAll('.hardware-card');
  let totalPrice = 0;
  hardwareItems.forEach(item => {
    const qtyEl = item.querySelector('.hardware-qty');
    const priceValueElement = item.querySelector('.price-value');
    const qty = parseInt(qtyEl?.dataset.qty) || 0;
    const basePrice = parseInt(priceValueElement?.dataset.basePrice) || 0;
    totalPrice += basePrice * qty;
  });
  return totalPrice;
}

// -------------------- Validation --------------------
function checkValidity(isValid) {
  const nextBtn = document.getElementById('next-button');
  const totalFooter = document.getElementsByClassName('footer-total')[0];

  if (!nextBtn || !totalFooter) return;

  if (isValid) {
    nextBtn.disabled = false;
    nextBtn.style.opacity = '1';
    totalFooter.style.display = 'inline-flex';
    updateOrderSummary();
  } else {
    nextBtn.disabled = true;
    nextBtn.style.opacity = '0.6';
    totalFooter.style.display = 'none';
  }
}

// -------------------- Service Array --------------------
function updateServiceArray(categoryTitle, itemDetails, removeTitle) {
  let category = serviceArray.find(c => c.title === categoryTitle);
  if (!category) return;

  if (removeTitle) {
    category.items = category.items.filter(item => item.title !== removeTitle);
  }

  let existingItemIndex = category.items.findIndex(item => item.title === itemDetails.title);
  if (existingItemIndex !== -1) {
    category.items[existingItemIndex] = itemDetails;
  } else {
    category.items.push(itemDetails);
  }
}

function updateSelectedHardware(hardwareTitle, quantity, itemDetails) {
  if (quantity > 0) {
    selectedHardware[hardwareTitle] = { ...itemDetails, quantity };
  } else {
    delete selectedHardware[hardwareTitle];
  }
  updateOrderSummary();
}

// -------------------- Order Summary --------------------
function updateOrderSummary() {
  const totalExtensions = hardwareQtyTotal();
  const { costPerExtension, monthlyPlatformFee } = getCostPerExtension(totalExtensions);
  const extensionCost = totalExtensions * costPerExtension;

  const virtualNumberCostElement = document.getElementById('virtual-number-cost');
  const includeVirtualNumberCost = virtualNumberCostElement && virtualNumberCostElement.style.display !== 'none';
  const virtualNumberCost = includeVirtualNumberCost ? 90 : 0;

  const totalMRC = monthlyPlatformFee + extensionCost + virtualNumberCost;
  const hardwareCost = hardwarePriceTotal();
  const totalUpfrontCost = hardwareCost + totalMRC;

  const el = (id) => document.getElementById(id);

  const monthlyPlatformFeeEl = el('monthly-platform-fee');
  const extensionsDescEl     = el('extensions-description');
  const extensionsPriceEl    = el('extensions-price');
  const totalMonthlyCostEl   = el('total-monthly-cost');
  const concurrentCallsEl    = el('concurrent-calls-count');
  const totalOnceOffCostEl   = el('total-once-off-cost');
  const monthlyInvoiceEl     = el('monthly-invoice-amount');

  if (monthlyPlatformFeeEl) monthlyPlatformFeeEl.textContent = formatPrice(monthlyPlatformFee);
  if (extensionsDescEl)     extensionsDescEl.textContent     = `${totalExtensions} Extensions @ ${formatPrice(costPerExtension)}/extension`;
  if (extensionsPriceEl)    extensionsPriceEl.textContent    = formatPrice(extensionCost);
  if (totalMonthlyCostEl)   totalMonthlyCostEl.innerHTML     = formatPrice(totalMRC);
  if (concurrentCallsEl)    concurrentCallsEl.textContent    = totalExtensions;
  if (totalOnceOffCostEl)   totalOnceOffCostEl.innerHTML     = formatPrice(totalUpfrontCost);
  if (monthlyInvoiceEl)     monthlyInvoiceEl.textContent     = formatPrice(totalMRC);

  updateHardwareSummary();
}

function updateHardwareSummary() {
  const hardwareSummary = document.getElementById('hardware-summary');
  if (!hardwareSummary) return;

  hardwareSummary.innerHTML = '';
  Object.values(selectedHardware).forEach(item => {
    if (item.quantity > 0) {
      const hardwareItem = document.createElement('div');
      hardwareItem.className = 'pricing-item hardware-item';
      hardwareItem.innerHTML = `
        <div class="item-details">
          <h3>${item.title}</h3>
          <p>${item.description} (Qty: ${item.quantity})</p>
        </div>
        <div class="item-price">${item.price}</div>
      `;
      hardwareSummary.appendChild(hardwareItem);
    }
  });
}

// -------------------- Virtual Number Logic --------------------
window.virtualNumberBtn = function(n) {
  const newNumberInput = document.getElementById('new-number-input');
  const portNumberInput = document.getElementById("port-number-input");

  if (n === 0) {
    if (newNumberInput) {
      newNumberInput.style.display = 'block';
      newNumberInput.classList.add('slide-in-top');
    }
    if (portNumberInput) portNumberInput.style.display = 'none';
    checkValidity(false);
  } else if (n === 1) {
    if (portNumberInput) {
      portNumberInput.style.display = 'block';
      portNumberInput.classList.add('slide-in-top');
    }
    if (newNumberInput) newNumberInput.style.display = 'none';
    checkValidity(false);
  }
};

window.addAnotherNumber = function() {
  transferNumberCount++;
  const portNumbersContainer = document.getElementById('port-numbers-container');
  if (!portNumbersContainer) return;

  const newNumberInput = document.createElement('input');
  newNumberInput.type = 'text';
  newNumberInput.id = `port-number-input-${transferNumberCount}`;
  newNumberInput.placeholder = 'Enter another number:';
  newNumberInput.pattern = '0[1-5]\\d{8}';
  newNumberInput.maxLength = '10';
  newNumberInput.required = true;
  portNumbersContainer.appendChild(newNumberInput);
};

function validateTransferNumber(inputElement) {
  const portNumberValue = inputElement.value;
  if (portNumberValue.length > 0 && inputElement.checkValidity()) {
    inputElement.style.border = "2px solid #4BD37B";
  } else {
    inputElement.style.border = "2px solid #FF5A79";
  }
}

// ==================== Step-2 Summary Ring (unchanged selectors) ====================
function initSummaryRing() {
  const card      = document.querySelector('[data-summary-card]') || document.getElementById('summary-card');
  const monthlyEl = document.querySelector('[data-total-monthly]') || document.getElementById('total-footer-price');
  const onceoffEl = document.querySelector('[data-total-onceoff]') || document.getElementById('total-onceoff');
  if (!card || !monthlyEl || !onceoffEl) return;

  const toNum = (t) => {
    const s = String(t || '')
      .replace(/[^\d,.\-]/g, '')
      .replace(/\.(?=\d{3}\b)/g, '');
    const n = Number(s.replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  };

  const refresh = () => {
    const sum = toNum(monthlyEl.textContent) + toNum(onceoffEl.textContent);
    card.classList.toggle('checkout-ring', sum > 0);
  };

  new MutationObserver(refresh).observe(monthlyEl, { childList: true, characterData: true, subtree: true });
  new MutationObserver(refresh).observe(onceoffEl, { childList: true, characterData: true, subtree: true });
  document.addEventListener('cart:updated', refresh);
  document.addEventListener('cart:recalculated', refresh);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refresh, { once: true });
  } else {
    refresh();
  }
}

// ==================== Left Section Slider (anchors stay the same) ====================
function initSectionSlider() {
  const slider   = document.querySelector('[data-slider]') || document.getElementById('section-slider');
  if (!slider) return;

  const upBtn    = slider.querySelector('[data-slider-prev]') || document.getElementById('slide-up');
  const downBtn  = slider.querySelector('[data-slider-next]') || document.getElementById('slide-down');
  const links    = Array.from(slider.querySelectorAll('[data-section-link]'));
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (!links.length || !sections.length) return;

  let currentIndex = 0;

  const setActiveById = (id) => {
    links.forEach(a => {
      const active = a.getAttribute('href').slice(1) === id;
      a.setAttribute('aria-current', active ? 'true' : 'false');
    });
    currentIndex = Math.max(0, sections.findIndex(s => s.id === id));
    if (upBtn)   upBtn.disabled = currentIndex === 0;
    if (downBtn) downBtn.disabled = currentIndex === sections.length - 1;
  };

  const scrollToIndex = (i) => {
    if (i < 0 || i >= sections.length) return;
    const el  = sections[i];
    const top = el.getBoundingClientRect().top + window.pageYOffset - 20;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  links.forEach((a, idx) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToIndex(idx);
    });
  });
  upBtn?.addEventListener('click', () => scrollToIndex(currentIndex - 1));
  downBtn?.addEventListener('click', () => scrollToIndex(currentIndex + 1));

  const obs = new IntersectionObserver((entries) => {
    let best = null, bestDist = Infinity;
    const center = window.innerHeight / 2;
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const r = e.target.getBoundingClientRect();
      const dist = Math.abs((r.top + r.height / 2) - center);
      if (dist < bestDist) { bestDist = dist; best = e.target; }
    });
    if (best) setActiveById(best.id);
  }, { root: null, threshold: 0.25 });

  sections.forEach(s => obs.observe(s));
  setActiveById(sections[0]?.id || '');
}

// ==================== Boot ====================
(function boot() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initSummaryRing();
      initSectionSlider();
      // Example: where you plug renderers (they’ll resolve to plural IDs)
      // renderTeam1CardsInto?.(rows[1]());
      // renderTeam2CardsInto?.(rows[2]());
      // renderTeam3CardsInto?.(rows[3]());
      // renderWirelessCardsInto?.(rows.wireless());
    }, { once: true });
  } else {
    initSummaryRing();
    initSectionSlider();
    // renderTeam1CardsInto?.(rows[1]());
    // renderTeam2CardsInto?.(rows[2]());
    // renderTeam3CardsInto?.(rows[3]());
    // renderWirelessCardsInto?.(rows.wireless());
  }
})();
