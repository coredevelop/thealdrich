class CartDrawerItems extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector(".cart-drawer-items__form");
    this.drawer = this.closest("cart-drawer");
    this.lineItemStatusElement = document.getElementById("cart-drawer-line-item-status");
    this.currentItemCount = this.calculateItemCount();
    this.debouncedOnChange = this.debounce((event) => {
      this.onChange(event);
    }, 300);
    this.addEventListener("change", this.debouncedOnChange.bind(this));
  }
  calculateItemCount() {
    return Array.from(this.querySelectorAll('[name="updates[]"]')).reduce(
      (total, quantityInput) => total + parseInt(quantityInput.value || 0),
      0
    );
  }
  onChange(event) {
    if (event.target.name === "updates[]") {
      this.updateQuantity(
        event.target.dataset.index,
        event.target.value,
        document.activeElement.getAttribute("name"),
        event.target.dataset.quantityVariantId
      );
    }
  }
  getSectionsToRender() {
    return [
      {
        id: "cart-drawer-items",
        section: "cart-drawer-items",
        selector: ".cart-drawer-items__products"
      },
      {
        id: "cart-drawer-footer",
        section: "cart-drawer-footer",
        selector: "#cart-drawer-footer-content"
      },
      {
        id: "cart-button",
        section: "cart-button",
        selector: ".shopify-section"
      },
      {
        id: "cart-icon-button",
        section: "cart-icon-button",
        selector: ".shopify-section"
      }
    ];
  }
  async updateQuantity(line, quantity, name, variantId) {
    var _a;
    this.enableLoading(line);
    const quantityInput = document.getElementById(`DrawerQuantity-${line}`);
    const itemElement = document.getElementById(`CartDrawerItem-${line}`);
    const originalQuantity = quantityInput ? quantityInput.value : null;
    if (quantityInput) {
      quantityInput.value = quantity;
    }
    if (quantity === 0 && itemElement) {
      itemElement.style.opacity = "0.5";
      itemElement.style.transition = "opacity 0.3s ease";
    }
    try {
      const body = JSON.stringify({
        line,
        quantity,
        sections: this.getSectionsToRender().map((section) => section.section),
        sections_url: window.location.pathname
      });
      const response = await fetch(`${theme.routes.cart_change_url}`, {
        ...theme.fetchConfig(),
        body
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }
      const state = await response.json();
      if (state.item_count === 0) {
        (_a = this.drawer) == null ? void 0 : _a.showEmpty();
      }
      this.getSectionsToRender().forEach((section) => {
        var _a2;
        const elementToReplace = ((_a2 = document.getElementById(section.id)) == null ? void 0 : _a2.querySelector(section.selector)) || document.getElementById(section.id);
        const sectionHTML = this.getSectionInnerHTML(
          state.sections[section.section],
          section.selector
        );
        if (elementToReplace && sectionHTML) {
          elementToReplace.innerHTML = sectionHTML;
        }
      });
      this.updateLiveRegions(line, state.item_count);
      const drawer = this.closest("cart-drawer");
      if (drawer) {
        const countElement = drawer.querySelector("[data-cart-count]");
        if (countElement) {
          countElement.textContent = state.item_count > 0 ? `(${state.item_count})` : "";
        }
      }
      const newLineItem = document.getElementById(`CartDrawerItem-${line}`);
      if (newLineItem && newLineItem.querySelector(`[name="${name}"]`)) {
        newLineItem.querySelector(`[name="${name}"]`).focus();
      }
      publish(PUB_SUB_EVENTS.cartUpdate, {
        source: "cart-drawer",
        cartData: state,
        variantId
      });
    } catch (error) {
      if (quantityInput && originalQuantity !== null) {
        quantityInput.value = originalQuantity;
      }
      if (itemElement && quantity === 0) {
        itemElement.style.opacity = "1";
      }
      this.handleError(error, line, quantityInput);
    } finally {
      this.disableLoading();
    }
  }
  handleError(error, line, quantityInput) {
    var _a, _b;
    this.querySelectorAll(`#CartDrawerItem-${line} .loading-spinner`).forEach((spinner) => {
      const totalContent = spinner.parentElement.querySelector(
        ".cart-drawer-item__total-content"
      );
      if (totalContent) {
        totalContent.classList.remove("hidden");
      }
      spinner.classList.add("hidden");
      spinner.classList.remove("block");
    });
    const lineItem = document.getElementById(`CartDrawerItem-${line}`);
    const errorElement = lineItem == null ? void 0 : lineItem.querySelector(".cart-drawer-item__error");
    const errorText = lineItem == null ? void 0 : lineItem.querySelector(".cart-drawer-item__error-text");
    if (errorElement && errorText) {
      let errorData = {};
      try {
        errorData = JSON.parse(error.message);
      } catch (e) {
        console.error("Error parsing JSON:", e);
      }
      errorText.textContent = errorData.errors || "An error occurred";
      errorElement.classList.remove("hidden");
      setTimeout(() => {
        errorElement.classList.add("hidden");
      }, 3e3);
    }
    if (quantityInput && ((_b = (_a = window.theme) == null ? void 0 : _a.cartData) == null ? void 0 : _b.items)) {
      const cartItem = window.theme.cartData.items[line - 1];
      if (cartItem) {
        quantityInput.value = cartItem.quantity;
      }
    }
  }
  getSectionInnerHTML(html, selector = ".shopify-section") {
    const sectionHTML = new DOMParser().parseFromString(html, "text/html").querySelector(selector);
    return sectionHTML ? sectionHTML.innerHTML : false;
  }
  updateLiveRegions(line, itemCount) {
    this.currentItemCount = itemCount;
    if (this.lineItemStatusElement) {
      this.lineItemStatusElement.setAttribute("aria-hidden", true);
    }
    const cartStatus = document.getElementById("cart-drawer-live-region-text");
    if (cartStatus) {
      cartStatus.setAttribute("aria-hidden", false);
      setTimeout(() => {
        cartStatus.setAttribute("aria-hidden", true);
      }, 1e3);
    }
  }
  enableLoading(line) {
    if (this.form) {
      this.form.classList.add("pointer-events-none");
    }
    this.querySelectorAll(`#CartDrawerItem-${line} .loading-spinner`).forEach(
      (spinner) => {
        const totalContent = spinner.parentElement.querySelector(
          ".cart-drawer-item__total-content"
        );
        totalContent.classList.add("hidden");
        spinner.classList.remove("hidden");
        spinner.classList.add("block");
      }
    );
    document.activeElement.blur();
    if (this.lineItemStatusElement) {
      this.lineItemStatusElement.setAttribute("aria-hidden", false);
    }
  }
  disableLoading() {
    if (this.form) {
      this.form.classList.remove("pointer-events-none");
    }
    this.querySelectorAll(".loading-spinner").forEach((spinner) => {
      const totalContent = spinner.parentElement.querySelector(
        ".cart-drawer-item__total-content"
      );
      if (totalContent) {
        totalContent.classList.remove("hidden");
      }
      spinner.classList.add("hidden");
      spinner.classList.remove("block");
    });
  }
  debounce(fn, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
  }
}
class CartDrawerRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", (event) => {
      event.preventDefault();
      const cartItems = this.closest("cart-drawer-items");
      if (cartItems) {
        cartItems.updateQuantity(this.dataset.index, 0);
      }
    });
  }
}
customElements.define("cart-drawer-items", CartDrawerItems);
customElements.define("cart-drawer-remove-button", CartDrawerRemoveButton);
