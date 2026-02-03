// script.js
(function () {
  const product = {
    id: "aurora-bottle",
    name: "Aurora™ Smart Insulated Water Bottle",
    price: 49.99,
    compareAt: 69.99,
    image: "https://images.unsplash.com/photo-1526401485004-2aa7c769f393?auto=format&fit=crop&w=600&q=80"
  };

  const quantityValue = document.querySelector(".quantity-value");
  const addToCartButtons = document.querySelectorAll("[data-add-to-cart]");
  const cartButton = document.querySelector(".cart-button");
  const cartPanel = document.querySelector(".cart-panel");
  const cartOverlay = document.querySelector(".cart-overlay");
  const cartItemsEl = document.querySelector(".cart-items");
  const cartSubtotalEl = document.querySelector(".cart-subtotal");
  const cartCountEl = document.querySelector(".cart-count");
  const closeCartBtn = document.querySelector(".close-cart");
  const stickyBar = document.querySelector(".sticky-bar");
  const heroSection = document.querySelector(".product-hero");
  const reviewSummary = document.querySelector(".review-summary");
  const reviewSection = document.querySelector("#reviews");
  const writeReviewBtn = document.querySelector(".write-review");
  const reviewModal = document.querySelector(".review-modal");
  const closeModalBtn = document.querySelector(".close-modal");
  const reviewForm = document.querySelector(".review-form");
  const accordionHeaders = document.querySelectorAll(".accordion-header");
  const detailTabs = document.querySelectorAll(".detail-tab");
  const detailPanels = document.querySelectorAll(".detail-panel");
  const galleryImages = document.querySelectorAll(".gallery-image");
  const galleryDots = document.querySelectorAll(".dot");
  const prevBtn = document.querySelector(".gallery-nav.prev");
  const nextBtn = document.querySelector(".gallery-nav.next");
  const swatches = document.querySelectorAll(".swatch");
  const sizeButtons = document.querySelectorAll(".size-btn");

  let currentSlide = 0;
  let cart = [];

  const safeStorage = {
    get(key) {
      try {
        return JSON.parse(localStorage.getItem(key) || "null");
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* ignore */
      }
    }
  };

  function loadCartFromStorage() {
    const saved = safeStorage.get("aurora-cart");
    if (Array.isArray(saved)) {
      cart = saved;
    }
  }

  function saveCartToStorage() {
    safeStorage.set("aurora-cart", cart);
  }

  function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountEl.textContent = count;
  }

  function formatPrice(value) {
    return `$${value.toFixed(2)}`;
  }

  function renderCart() {
    cartItemsEl.innerHTML = "";
    if (cart.length === 0) {
      cartItemsEl.innerHTML = "<p>Your cart is empty.</p>";
    } else {
      cart.forEach((item) => {
        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
          <img src="${product.image}" alt="${item.name}">
          <div class="item-info">
            <p><strong>${item.name}</strong></p>
            <p>${item.quantity} × ${formatPrice(item.price)}</p>
          </div>
          <p><strong>${formatPrice(item.price * item.quantity)}</strong></p>
        `;
        cartItemsEl.appendChild(row);
      });
    }
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartSubtotalEl.textContent = formatPrice(subtotal);
    updateCartCount();
    saveCartToStorage();
  }

  function addToCart(quantity) {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, quantity });
    }
    renderCart();
    pulseCart();
  }

  function pulseCart() {
    cartButton.classList.add("active");
    setTimeout(() => cartButton.classList.remove("active"), 500);
  }

  function getQuantity() {
    const qty = parseInt(quantityValue.textContent, 10);
    return Number.isNaN(qty) || qty < 1 ? 1 : qty;
  }

  function changeQuantity(delta) {
    const newQty = Math.max(1, getQuantity() + delta);
    quantityValue.textContent = String(newQty);
  }

  function openCart() {
    cartPanel.classList.add("open");
    cartOverlay.classList.add("visible");
    cartPanel.setAttribute("aria-hidden", "false");
    cartOverlay.setAttribute("aria-hidden", "false");
  }

  function closeCart() {
    cartPanel.classList.remove("open");
    cartOverlay.classList.remove("visible");
    cartPanel.setAttribute("aria-hidden", "true");
    cartOverlay.setAttribute("aria-hidden", "true");
  }

  function toggleStickyBar() {
    const heroHeight = heroSection.offsetHeight;
    const shouldShow = window.scrollY > heroHeight * 0.45 && window.innerWidth < 768;
    stickyBar.classList.toggle("visible", shouldShow);
  }

  function handleAccordionClick(currentHeader) {
    accordionHeaders.forEach((header) => {
      const body = header.nextElementSibling;
      const isTarget = header === currentHeader;
      header.setAttribute("aria-expanded", isTarget && header.getAttribute("aria-expanded") !== "true");
      if (isTarget) {
        const open = header.getAttribute("aria-expanded") === "true";
        body.style.maxHeight = open ? `${body.scrollHeight}px` : "0px";
        body.classList.toggle("open", open);
      } else {
        header.setAttribute("aria-expanded", "false");
        body.style.maxHeight = "0px";
        body.classList.remove("open");
      }
    });
  }

  function handleDetailTab(targetId) {
    detailTabs.forEach((tab) => {
      const isActive = tab.dataset.target === targetId;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    detailPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === targetId);
    });
  }

  function activateSelection(buttons, target) {
    buttons.forEach((btn) => {
      const isActive = btn === target;
      btn.classList.toggle("selected", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function showSlide(index) {
    const total = galleryImages.length;
    currentSlide = (index + total) % total;
    galleryImages.forEach((img, idx) => {
      img.classList.toggle("active", idx === currentSlide);
    });
    galleryDots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === currentSlide);
    });
  }

  function bindEvents() {
    document.querySelectorAll(".qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        changeQuantity(action === "increase" ? 1 : -1);
      });
    });

    addToCartButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        addToCart(getQuantity());
        if (window.innerWidth >= 768) {
          openCart();
        }
      });
    });

    cartButton.addEventListener("click", openCart);
    closeCartBtn.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);

    window.addEventListener("scroll", toggleStickyBar);
    window.addEventListener("resize", toggleStickyBar);

    reviewSummary.addEventListener("click", (e) => {
      e.preventDefault();
      reviewSection.scrollIntoView({ behavior: "smooth" });
    });

    accordionHeaders.forEach((header) => {
      header.addEventListener("click", () => handleAccordionClick(header));
      header.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleAccordionClick(header);
        }
      });
    });

    detailTabs.forEach((tab) => {
      tab.addEventListener("click", () => handleDetailTab(tab.dataset.target));
    });

    prevBtn.addEventListener("click", () => showSlide(currentSlide - 1));
    nextBtn.addEventListener("click", () => showSlide(currentSlide + 1));
    galleryDots.forEach((dot) => {
      dot.addEventListener("click", () => showSlide(Number(dot.dataset.slide)));
    });

    swatches.forEach((swatch) => {
      swatch.addEventListener("click", () => activateSelection(swatches, swatch));
      swatch.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activateSelection(swatches, swatch);
        }
      });
    });

    sizeButtons.forEach((btn) => {
      btn.addEventListener("click", () => activateSelection(sizeButtons, btn));
    });

    writeReviewBtn.addEventListener("click", () => {
      reviewModal.classList.add("open");
      reviewModal.setAttribute("aria-hidden", "false");
    });

    closeModalBtn.addEventListener("click", () => {
      reviewModal.classList.remove("open");
      reviewModal.setAttribute("aria-hidden", "true");
    });

    reviewModal.addEventListener("click", (e) => {
      if (e.target === reviewModal) {
        reviewModal.classList.remove("open");
        reviewModal.setAttribute("aria-hidden", "true");
      }
    });

    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();
      reviewModal.classList.remove("open");
      reviewModal.setAttribute("aria-hidden", "true");
      alert("Thanks for your review!"); // placeholder for future wiring
    });
  }

  function initAccordions() {
    accordionHeaders.forEach((header) => {
      const body = header.nextElementSibling;
      body.style.maxHeight = "0px";
    });
  }

  function init() {
    loadCartFromStorage();
    renderCart();
    bindEvents();
    initAccordions();
    handleDetailTab("description");
    showSlide(0);
    toggleStickyBar();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
