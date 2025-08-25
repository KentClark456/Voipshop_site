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

    document.getElementById('monthly-platform-fee').textContent = formatPrice(monthlyPlatformFee);
    document.getElementById('extensions-description').textContent = `${totalExtensions} Extensions @ ${formatPrice(costPerExtension)}/extension`;
    document.getElementById('extensions-price').textContent = formatPrice(extensionCost);
    document.getElementById('total-monthly-cost').innerHTML = formatPrice(totalMRC);
    document.getElementById('concurrent-calls-count').textContent = totalExtensions;
    document.getElementById('total-once-off-cost').innerHTML = formatPrice(totalUpfrontCost);
    document.getElementById('monthly-invoice-amount').textContent = formatPrice(totalMRC);

    updateHardwareSummary();
}

function updateHardwareSummary() {
    const hardwareSummary = document.getElementById('hardware-summary');
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
