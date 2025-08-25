function formatPrice(price) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumSignificantDigits: 5,
  }).format(price);
}

// Toggle More Products section
window.toggleMoreProducts = function toggleMoreProducts() {
  const moreProductsSection = document.getElementById("more-products-section");
  const toggleIcon = document.getElementById("toggle-icon");
  const moreIndicatorsContainer = document.getElementById(
    "more-hardware-indicators"
  );

  if (moreProductsSection.style.display === "none") {
    moreProductsSection.style.display = "flex";
    moreIndicatorsContainer.style.display = "flex";
    toggleIcon.classList.add("rotated");
    initializeScrollIndicators(
      "more-products-section",
      "more-hardware-indicators"
    );
  } else {
    moreProductsSection.style.display = "none";
    moreIndicatorsContainer.style.display = "none";
    toggleIcon.classList.remove("rotated");
  }
};

// Scroll Indicators Functions
function initializeScrollIndicators(scrollContainerId, indicatorsContainerId) {
  // Initialize for main hardware section
  const mainContainer = document.getElementById(scrollContainerId);
  const mainIndicatorsContainer = document.getElementById(
    indicatorsContainerId
  );
  console.log(
    "Initializing scroll indicators for:",
    scrollContainerId,
    indicatorsContainerId
  );
  console.log("Main Container:", mainContainer);
  console.log("Indicators Container:", mainIndicatorsContainer);
  if (mainContainer && mainIndicatorsContainer) {
    setupScrollIndicators(mainContainer, mainIndicatorsContainer);
  }
}

function setupScrollIndicators(container, indicatorsContainer) {
  const cards = container.querySelectorAll(".hardware-card");
  if (cards.length === 0) return;

  const containerWidth = container.clientWidth;
  const cardWidth = cards[0].offsetWidth;

  // Calculate the effective card width including margins
  const computedStyle = window.getComputedStyle(cards[0]);
  const paddingLeft = parseInt(computedStyle.paddingLeft, 10) || 0;
  const paddingRight = parseInt(computedStyle.paddingRight, 10) || 0;
  const effectiveCardWidth = cardWidth + paddingLeft + paddingRight;

  const cardsPerView = Math.floor(containerWidth / effectiveCardWidth);
  const totalPages = Math.ceil(cards.length / cardsPerView);

  // Clear existing indicators
  indicatorsContainer.innerHTML = "";

  // Create indicators only if we have more than one page
  if (totalPages > 1) {
    for (let i = 0; i < totalPages; i++) {
      const indicator = document.createElement("button");
      indicator.className = "scroll-indicator";
      indicator.setAttribute("aria-label", `Go to page ${i + 1}`);
      indicator.addEventListener("click", () =>
        scrollToPage(container, i, cardsPerView, cardWidth)
      );
      indicatorsContainer.appendChild(indicator);
    }

    // Set first indicator as active
    const firstIndicator =
      indicatorsContainer.querySelector(".scroll-indicator");
    if (firstIndicator) {
      firstIndicator.classList.add("active");
    }

    // Add scroll event listener to update active indicator
    container.addEventListener("scroll", () =>
      updateActiveIndicator(
        container,
        indicatorsContainer,
        cardsPerView,
        cardWidth
      )
    );
  }
}

function scrollToPage(container, pageIndex, cardsPerView, cardWidth) {
  const scrollPosition = pageIndex * cardsPerView * cardWidth;
  debugger;
  container.scrollTo({
    left: scrollPosition,
    behavior: "smooth",
  });
}

function updateActiveIndicator(
  container,
  indicatorsContainer,
  cardsPerView,
  cardWidth
) {
  const scrollLeft = container.scrollLeft;
  const currentPage = Math.round(
    (scrollLeft + 50) / (cardsPerView * cardWidth)
  );
  debugger;

  const indicators = indicatorsContainer.querySelectorAll(".scroll-indicator");
  indicators.forEach((indicator, index) => {
    debugger;
    indicator.classList.toggle("active", index === currentPage);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  //Drop Down Menu
  const dropdown = document.querySelector(".drop-down");
  const dropdownBtn = document.querySelector(".menu");

  window.toggleDropdown = function toggleDropdown() {
    dropdownBtn.classList.toggle("opened");
    dropdownBtn.setAttribute(
      "aria-expanded",
      dropdownBtn.classList.contains("opened")
    );
    dropdown.classList.toggle("show-menu");
  };
});
