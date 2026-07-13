class CartDiscount extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector("form");
    this.input = this.querySelector('input[name="discount"]');
    this.applyButton = this.querySelector("[data-apply-discount]");
    this.messageContainer = this.querySelector("[data-discount-message]");
    this.codesContainer = this.querySelector("[data-discount-codes-container]");
    if (this.form) {
      this.form.addEventListener("submit", this.handleSubmit.bind(this));
    }
    this.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-discount]");
      if (removeButton) {
        event.preventDefault();
        const code = removeButton.getAttribute("data-remove-discount");
        this.removeDiscount(code);
      }
    });
  }
  connectedCallback() {
    this.updateDiscountChips();
  }
  getCurrentCodes() {
    const buttons = this.querySelectorAll("[data-remove-discount]");
    const codes = Array.from(buttons).map((btn) => btn.getAttribute("data-remove-discount"));
    return codes;
  }
  async handleSubmit(event) {
    event.preventDefault();
    const discountCode = this.input.value.trim();
    if (!discountCode) return;
    this.setLoading(true);
    this.clearMessage();
    try {
      await this.applyDiscount(discountCode);
      this.input.value = "";
      this.showMessage(theme.cartStrings.discountApplied, "success");
    } catch (error) {
      this.showMessage(error.message || theme.cartStrings.discountApplyError, "error");
    } finally {
      this.setLoading(false);
    }
  }
  async applyDiscount(discountCode) {
    var _a, _b;
    const currentCodes = this.getCurrentCodes();
    if (currentCodes.some((code) => code.toUpperCase() === discountCode.toUpperCase())) {
      throw new Error(theme.cartStrings.discountAlreadyApplied);
    }
    const allCodes = [...currentCodes, discountCode];
    const codesString = allCodes.join(",");
    const response = await fetch(`${theme.routes.cart_update_url}.js`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ discount: codesString })
    });
    if (!response.ok) {
      throw new Error(theme.cartStrings.discountApplyFailed);
    }
    const state = await response.json();
    const wasApplied = state.discount_codes && state.discount_codes.some((dc) => dc.code.toUpperCase() === discountCode.toUpperCase() && dc.applicable);
    if (!wasApplied) {
      throw new Error(theme.cartStrings.discountInvalid);
    }
    const isDrawer = this.closest("cart-drawer") !== null;
    let sections;
    let cartItemsSection, cartFooterSection;
    if (isDrawer) {
      sections = "cart-drawer-items,cart-drawer-footer";
    } else {
      cartItemsSection = (_a = document.getElementById("main-cart-items")) == null ? void 0 : _a.dataset.sectionId;
      cartFooterSection = (_b = document.getElementById("main-cart-footer")) == null ? void 0 : _b.dataset.sectionId;
      if (!cartItemsSection || !cartFooterSection) {
        throw new Error("Required cart sections not found");
      }
      sections = `${cartItemsSection},${cartFooterSection}`;
    }
    const sectionsUrl = `${window.location.pathname}?sections=${sections}`;
    const sectionsResponse = await fetch(sectionsUrl);
    const sectionsData = await sectionsResponse.json();
    const sectionIds = isDrawer ? null : { itemsSection: cartItemsSection, footerSection: cartFooterSection };
    this.renderSections(sectionsData, isDrawer, sectionIds);
    this.publishCartUpdate();
  }
  async removeDiscount(targetCode) {
    var _a, _b;
    this.setLoading(true);
    this.clearMessage();
    try {
      const currentCodes = this.getCurrentCodes();
      const codesToKeep = currentCodes.filter(
        (code) => code.toUpperCase() !== targetCode.toUpperCase()
      );
      const codesString = codesToKeep.join(",");
      const response = await fetch(`${theme.routes.cart_update_url}.js`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ discount: codesString })
      });
      if (!response.ok) {
        throw new Error(theme.cartStrings.discountRemoveFailed);
      }
      const isDrawer = this.closest("cart-drawer") !== null;
      let sections;
      let cartItemsSection, cartFooterSection;
      if (isDrawer) {
        sections = "cart-drawer-items,cart-drawer-footer";
      } else {
        cartItemsSection = (_a = document.getElementById("main-cart-items")) == null ? void 0 : _a.dataset.sectionId;
        cartFooterSection = (_b = document.getElementById("main-cart-footer")) == null ? void 0 : _b.dataset.sectionId;
        if (!cartItemsSection || !cartFooterSection) {
          throw new Error("Required cart sections not found");
        }
        sections = `${cartItemsSection},${cartFooterSection}`;
      }
      const sectionsUrl = `${window.location.pathname}?sections=${sections}`;
      const sectionsResponse = await fetch(sectionsUrl);
      const sectionsData = await sectionsResponse.json();
      const sectionIds = isDrawer ? null : { itemsSection: cartItemsSection, footerSection: cartFooterSection };
      this.renderSections(sectionsData, isDrawer, sectionIds);
      this.publishCartUpdate();
      this.showMessage(theme.cartStrings.discountRemoved, "success");
    } catch (error) {
      console.error("[cart-discount] Error removing discount:", error);
      this.showMessage(error.message || theme.cartStrings.discountRemoveError, "error");
    } finally {
      this.setLoading(false);
    }
  }
  /**
   * Helper method to extract inner HTML from a section using DOMParser
   * @param {string} html - The HTML string to parse
   * @param {string} selector - The CSS selector to find within the HTML
   * @returns {string|null} The inner HTML of the selected element, or null if not found
   */
  getSectionInnerHTML(html, selector = ".shopify-section") {
    var _a;
    return (_a = new DOMParser().parseFromString(html, "text/html").querySelector(selector)) == null ? void 0 : _a.innerHTML;
  }
  renderSections(sections, isDrawer = true, sectionIds = null) {
    if (isDrawer) {
      if (sections["cart-drawer-items"]) {
        const itemsElement = document.querySelector("cart-drawer-items");
        const itemsHTML = this.getSectionInnerHTML(sections["cart-drawer-items"], "cart-drawer-items");
        if (itemsElement && itemsHTML !== null) {
          const newElement = new DOMParser().parseFromString(sections["cart-drawer-items"], "text/html").querySelector("cart-drawer-items");
          if (newElement) {
            itemsElement.replaceWith(newElement);
          }
        }
      }
      if (sections["cart-drawer-footer"]) {
        const footerElement = document.querySelector("#cart-drawer-footer");
        const openDetails = Array.from((footerElement == null ? void 0 : footerElement.querySelectorAll("details[open]")) || []).map((details) => {
          const parent = details.parentElement;
          if ((parent == null ? void 0 : parent.tagName.toLowerCase()) === "cart-note") return "cart-note";
          if ((parent == null ? void 0 : parent.tagName.toLowerCase()) === "cart-discount") return "cart-discount";
          return null;
        }).filter(Boolean);
        const activeElement = document.activeElement;
        let focusSelector = null;
        if (activeElement && (footerElement == null ? void 0 : footerElement.contains(activeElement))) {
          if (activeElement.id) {
            focusSelector = `#${activeElement.id}`;
          } else if (activeElement.name) {
            focusSelector = `[name="${activeElement.name}"]`;
          } else if (activeElement.hasAttribute("data-apply-discount")) {
            focusSelector = "[data-apply-discount]";
          } else if (activeElement.hasAttribute("data-remove-discount")) {
            const code = activeElement.getAttribute("data-remove-discount");
            focusSelector = `[data-remove-discount="${code}"]`;
          }
        }
        const footerContent = new DOMParser().parseFromString(sections["cart-drawer-footer"], "text/html").querySelector("#cart-drawer-footer-content");
        if (footerElement && footerContent) {
          footerElement.innerHTML = footerContent.outerHTML;
          openDetails.forEach((identifier) => {
            const details = footerElement.querySelector(`${identifier} details`);
            if (details) {
              details.open = true;
            }
          });
          if (focusSelector) {
            const elementToFocus = footerElement.querySelector(focusSelector);
            if (elementToFocus) {
              setTimeout(() => elementToFocus.focus(), 0);
            }
          }
        }
      }
    } else {
      if ((sectionIds == null ? void 0 : sectionIds.itemsSection) && sections[sectionIds.itemsSection]) {
        const itemsElement = document.querySelector(".cart-items__products");
        const itemsHTML = this.getSectionInnerHTML(sections[sectionIds.itemsSection], ".cart-items__products");
        if (itemsElement && itemsHTML !== null) {
          itemsElement.innerHTML = itemsHTML;
        }
      }
      if ((sectionIds == null ? void 0 : sectionIds.footerSection) && sections[sectionIds.footerSection]) {
        const footerElement = document.querySelector(".cart-footer__blocks");
        const footerHTML = this.getSectionInnerHTML(sections[sectionIds.footerSection], ".cart-footer__blocks");
        if (footerElement && footerHTML !== null) {
          footerElement.innerHTML = footerHTML;
        }
      }
    }
  }
  async updateDiscountChips() {
    try {
      const response = await fetch(`${theme.routes.cart_url}.js`);
      if (!response.ok) {
        console.error("[cart-discount] Failed to fetch cart data");
        return;
      }
      const cartData = await response.json();
      const existingCodes = this.getCurrentCodes().map((code) => code.toUpperCase());
      const lineLevelCodes = this.extractLineLevelDiscountCodes(cartData);
      const newCodes = lineLevelCodes.filter(
        (code) => !existingCodes.includes(code.toUpperCase())
      );
      this.appendDiscountChips(newCodes);
    } catch (error) {
      console.error("[cart-discount] Error updating discount chips:", error);
    }
  }
  extractLineLevelDiscountCodes(cartData) {
    const codes = /* @__PURE__ */ new Set();
    if (cartData.items) {
      cartData.items.forEach((item) => {
        if (item.line_level_discount_allocations) {
          item.line_level_discount_allocations.forEach((allocation) => {
            if (allocation.discount_application && allocation.discount_application.type === "discount_code" && allocation.discount_application.title) {
              codes.add(allocation.discount_application.title);
            }
          });
        }
      });
    }
    return Array.from(codes);
  }
  appendDiscountChips(codes) {
    if (!this.codesContainer || codes.length === 0) return;
    const isDrawer = this.closest("cart-drawer") !== null;
    const chipSizeClass = isDrawer ? "text-xs" : "text-sm";
    codes.forEach((code) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.setAttribute("data-remove-discount", code);
      chip.className = `discount-chip flex items-center gap-1.5 bg-primary-text-10 text-primary-text px-2 py-1 ${chipSizeClass} font-weight-navigation uppercase transition-colors cursor-pointer select-none`;
      chip.setAttribute("aria-label", theme.cartStrings.discountRemoved.replace("[code]", code));
      chip.innerHTML = `
        <span>${code}</span>
        <svg class="w-3 h-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      `;
      this.codesContainer.appendChild(chip);
    });
  }
  publishCartUpdate() {
    if (typeof window.PubSub !== "undefined" && window.PubSub.publish) {
      window.PubSub.publish(window.PUB_SUB_EVENTS.cartUpdate, {
        source: "cart-discount"
      });
    }
  }
  setLoading(isLoading) {
    if (this.applyButton) {
      this.applyButton.disabled = isLoading;
      const spinner = this.applyButton.querySelector(".loading-spinner");
      if (isLoading) {
        if (spinner) spinner.classList.remove("hidden");
      } else {
        if (spinner) spinner.classList.add("hidden");
      }
    }
  }
  showMessage(message, type = "success") {
    if (!this.messageContainer) return;
    this.messageContainer.textContent = message;
    this.messageContainer.classList.remove("hidden", "text-red-600", "text-green-600");
    this.messageContainer.classList.add(type === "error" ? "text-red-600" : "text-green-600");
    if (type === "success") {
      setTimeout(() => {
        this.clearMessage();
      }, 3e3);
    }
  }
  clearMessage() {
    if (this.messageContainer) {
      this.messageContainer.textContent = "";
      this.messageContainer.classList.add("hidden");
    }
  }
}
customElements.define("cart-discount", CartDiscount);
