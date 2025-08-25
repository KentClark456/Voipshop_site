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
        document.getElementById('total-footer-price').textContent = formatPrice(totalUpfrontCost);
        document.getElementById('total-cost-period').style.display = 'none';
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

    let qty = parseInt(hardwareQty.dataset.qty) || 0;
    let basePrice = parseInt(priceValueElement.dataset.basePrice) || 0;

    qty = isAdding ? Math.min(qty + 1, 9) : Math.max(qty - 1, 0);
    let deviceSum = basePrice * qty;

    hardwareCard.classList.toggle('selected', qty > 0);
    hardwareQty.style.display = qty > 0 ? 'block' : 'none';
    hardwareMinus.style.display = qty > 0 ? 'inline-flex' : 'none';
    hardwareQty.innerHTML = qty.toString();
    hardwareQty.dataset.qty = qty.toString();

    const hardwareTitle = hardwareCard.querySelector('.hardware-title h2').textContent;
    const hardwareImage = hardwareCard.querySelector('.hardware-img').src;
    const hardwareDescription = hardwareCard.querySelector('.hardware-title h3').textContent;

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
    const baseStationCard = document.getElementById('base-station-card');
    const baseStationQty = baseStationCard.querySelector('.hardware-qty');
    const baseStationMinus = baseStationCard.querySelector('.hardware-minus');
    let requiredBaseStations = 0;

    if (cordlessQty > 0) {
        requiredBaseStations = Math.ceil(cordlessQty / 8);
        baseStationCard.classList.add('selected');
        baseStationQty.style.display = 'block';
        baseStationMinus.style.display = 'inline-flex';
        baseStationQty.innerHTML = requiredBaseStations.toString();
        baseStationQty.dataset.qty = requiredBaseStations.toString();

        const priceValueElement = baseStationCard.querySelector('.price-value');
        const basePrice = parseInt(priceValueElement.dataset.basePrice) || 0;
        const totalPrice = basePrice * requiredBaseStations;

        updateSelectedHardware('Yealink W70B', requiredBaseStations, {
            image: baseStationCard.querySelector('.hardware-img').src,
            title: 'Yealink W70B',
            description: 'Base Station',
            price: formatPrice(totalPrice)
        });
    } else {
        baseStationCard.classList.remove('selected');
        baseStationQty.style.display = 'none';
        baseStationMinus.style.display = 'none';
        baseStationQty.innerHTML = '0';
        baseStationQty.dataset.qty = '0';

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
    const switchPorts = Math.ceil(totalQty / 2) * 2;
    const cableLength = totalQty * 20;

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
        const qty = parseInt(item.querySelector('.hardware-qty').dataset.qty) || 0;
        totalQty += qty;
    });
    return totalQty;
}

function hardwarePriceTotal() {
    const hardwareItems = document.querySelectorAll('.hardware-card');
    let totalPrice = 0;
    hardwareItems.forEach(item => {
        const qty = parseInt(item.querySelector('.hardware-qty').dataset.qty) || 0;
        const priceValueElement = item.querySelector('.price-value');
        const basePrice = parseInt(priceValueElement.dataset.basePrice) || 0;
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

    const monthlyPlatformFeeEl = document.getElementById('monthly-platform-fee');
    if (monthlyPlatformFeeEl) monthlyPlatformFeeEl.textContent = formatPrice(monthlyPlatformFee);

    const extensionsDescEl = document.getElementById('extensions-description');
    if (extensionsDescEl) extensionsDescEl.textContent = `${totalExtensions} Extensions @ ${formatPrice(costPerExtension)}/extension`;

    const extensionsPriceEl = document.getElementById('extensions-price');
    if (extensionsPriceEl) extensionsPriceEl.textContent = formatPrice(extensionCost);

    const totalMonthlyCostEl = document.getElementById('total-monthly-cost');
    if (totalMonthlyCostEl) totalMonthlyCostEl.innerHTML = formatPrice(totalMRC);

    const concurrentCallsEl = document.getElementById('concurrent-calls-count');
    if (concurrentCallsEl) concurrentCallsEl.textContent = totalExtensions;

    const totalOnceOffEl = document.getElementById('total-once-off-cost');
    if (totalOnceOffEl) totalOnceOffEl.innerHTML = formatPrice(totalUpfrontCost);

    const monthlyInvoiceEl = document.getElementById('monthly-invoice-amount');
    if (monthlyInvoiceEl) monthlyInvoiceEl.textContent = formatPrice(totalMRC);

    // Removed updateHardwareSummary() because that element no longer exists
}


// -------------------- Virtual Number Logic --------------------

window.virtualNumberBtn = function(n) {
    const newNumberInput = document.getElementById('new-number-input');
    const portNumberInput = document.getElementById("port-number-input");
    const newNumberBtn = document.getElementById('new-number');
    const portNumberBtn = document.getElementById('port-number');

    if (n === 0) {
        if (newNumberInput) {
            newNumberInput.style.display = 'block';
            newNumberInput.classList.add('slide-in-top');
        }
        if (portNumberInput) portNumberInput.style.display = 'none';
        if (newNumberBtn) newNumberBtn.classList.add('selected');
        if (portNumberBtn) portNumberBtn.classList.remove('selected');
        if (portNumberInput) portNumberInput.value = '';
        document.getElementById('provider-file')?.style.setProperty('display', 'none');
        document.getElementById('add-another-number')?.style.setProperty('display', 'none');
        document.getElementById('virtual-number-cost')?.style.setProperty('display', 'none');
        checkValidity(false);
    } else if (n === 1) {
        if (portNumberInput) {
            portNumberInput.style.display = 'block';
            portNumberInput.classList.add('slide-in-top');
        }
        if (newNumberInput) newNumberInput.style.display = 'none';
        if (newNumberBtn) newNumberBtn.classList.remove('selected');
        if (portNumberBtn) portNumberBtn.classList.add('selected');
        if (newNumberInput) newNumberInput.value = '0';
        document.getElementById('provider-file')?.style.setProperty('display', 'block');
        document.getElementById('add-another-number')?.style.setProperty('display', 'block');
        document.getElementById('virtual-number-cost')?.style.setProperty('display', 'none');
        checkValidity(false);
    }
};

window.addAnotherNumber = function() {
    transferNumberCount++;
    const portNumbersContainer = document.getElementById('port-numbers-container');
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.id = `port-number-input-${transferNumberCount}`;
    newInput.placeholder = 'Enter another number:';
    newInput.pattern = '0[1-5]\\d{8}';
    newInput.maxLength = '10';
    newInput.required = true;
    newInput.addEventListener('input', function () {
        validateTransferNumber(this);
    });
    portNumbersContainer?.appendChild(newInput);
};

function validateTransferNumber(inputElement) {
    const value = inputElement.value;
    if (value.length > 0 && inputElement.checkValidity()) {
        inputElement.style.border = "2px solid #4BD37B";
    } else {
        inputElement.style.border = "2px solid #FF5A79";
    }

    const allInputs = document.querySelectorAll('[id^="port-number-input"]');
    let allValid = true;
    let validNumbers = [];

    allInputs.forEach(input => {
        if (input.value.length > 0 && input.checkValidity()) {
            validNumbers.push(input.value);
        } else if (input.value.length > 0) {
            allValid = false;
        }
    });

    if (allValid && validNumbers.length > 0) {
        updateServiceArray('Virtual Number', {
            image: 'Assets/Group 1685.png',
            title: 'Transfer Numbers',
            description: validNumbers.join(', '),
            quantity: validNumbers.length,
            price: 'No monthly fee'
        }, 'New Number');

        document.getElementById('virtual-number-cost')?.style.setProperty('display', 'none');
        document.getElementById('total-footer-price').textContent = 'R 0';
        document.getElementById('total-cost-period')?.style.setProperty('display', 'none');
        checkValidity(true);
    } else {
        checkValidity(false);
    }
}

// Handle new number selection dropdown
document.getElementById('new-number-input')?.addEventListener('change', function () {
    const val = this.value;
    if (val !== '0') {
        this.style.border = "2px solid #4BD37B";
        updateServiceArray('Virtual Number', {
            image: 'Assets/Group 1685.png',
            title: 'New Number',
            description: 'Geographic number',
            quantity: 1,
            price: 'Included in setup'
        }, 'Transfer Number');

        document.getElementById('virtual-number-cost')?.style.setProperty('display', 'flex');
        document.getElementById('total-footer-price').textContent = formatPrice(90);
        document.getElementById('total-cost-period')?.style.setProperty('display', 'inline-flex');
        checkValidity(true);
    } else {
        this.style.border = "2px solid whitesmoke";
        document.getElementById('virtual-number-cost')?.style.setProperty('display', 'none');
        checkValidity(false);
    }
});

// Handle port number main input
document.getElementById('port-number-input')?.addEventListener('input', function () {
    const val = this.value;
    if (val.length > 0 && this.checkValidity()) {
        this.style.border = "2px solid #4BD37B";
        updateServiceArray('Virtual Number', {
            image: 'Assets/Group 1685.png',
            title: 'Transfer Number',
            description: `[ ${val} ]`,
            quantity: 1,
            price: 'No monthly fee'
        }, 'New Number');

        document.getElementById('virtual-number-cost')?.style.setProperty('display', 'none');
        document.getElementById('total-footer-price').textContent = 'R 0';
        document.getElementById('total-cost-period')?.style.setProperty('display', 'none');
        checkValidity(true);
    } else {
        this.style.border = "2px solid #FF5A79";
        document.getElementById('virtual-number-cost')?.style.setProperty('display', 'none');
        checkValidity(false);
    }
});
