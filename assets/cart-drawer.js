import { c as createFocusTrap } from "vendors/focus-trap.esm";
class CartDrawer extends HTMLElement {
  constructor() {
    super();
    this.drawer = this.querySelector(".cart-drawer__container");
    this.background = this.querySelector(".cart-drawer__modal-background");
    this.closeButton = this.querySelector(".cart-drawer__modal-close");
    this.itemsContainer = this.querySelector("#cart-drawer-items");
    this.footerContainer = this.querySelector("#cart-drawer-footer");
    this.loadingElement = this.querySelector(".cart-drawer__loading");
    this.emptyElement = this.querySelector(".cart-drawer__empty");
    this.isOpen = false;
    this.activeElement = null;
    this.focusTrap = createFocusTrap(this, {
      initialFocus: this.closeButton,
      allowOutsideClick: true
    });
    this.bindEvents();
    this.subscribeToCartUpdates();
    this.preloadSections();
  }
  bindEvents() {
    var _a, _b;
    (_a = this.closeButton) == null ? void 0 : _a.addEventListener("click", () => this.close());
    (_b = this.background) == null ? void 0 : _b.addEventListener("click", () => this.close());
    const continueButton = this.querySelector(".cart-drawer__continue");
    if (continueButton) {
      continueButton.addEventListener("click", () => this.close());
    }
    document.addEventListener("keyup", (event) => {
      if (event.code.toUpperCase() === "ESCAPE" && this.isOpen) {
        this.close();
      }
    });
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-cart-drawer-trigger]");
      if (trigger) {
        event.preventDefault();
        if (window.location.pathname === window.theme.routes.cart_url) {
          return;
        }
        this.open(trigger);
      }
    });
  }
  subscribeToCartUpdates() {
    this.cartUpdateUnsubscriber = subscribe(
      PUB_SUB_EVENTS.cartUpdate,
      (event) => {
        if (this.isOpen && event.source !== "cart-drawer") {
          this.updateSections();
        }
      }
    );
  }
  getSectionsToRender() {
    return [
      {
        id: "cart-drawer-items",
        selector: "cart-drawer-items"
      },
      {
        id: "cart-drawer-footer",
        selector: "#cart-drawer-footer-content"
      },
      {
        id: "cart-button"
      },
      {
        id: "cart-icon-button"
      }
    ];
  }
  open(activeElement = null, skipLoad = false) {
    if (this.isOpen) return;
    this.activeElement = activeElement || document.activeElement;
    this.isOpen = true;
    this.classList.remove("invisible");
    this.classList.add("visible");
    this.setAttribute("open", "");
    this.drawer.classList.remove("translate-x-full");
    this.drawer.classList.add("translate-x-0");
    document.body.classList.add("has-modal");
    if (!skipLoad) {
      if (!this.itemsContainer.dataset.loaded) {
        this.loadSections();
      } else {
        this.updateSections();
      }
    }
    setTimeout(() => {
      this.focusTrap.activate();
    }, 50);
  }
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.removeAttribute("open");
    this.drawer.classList.remove("translate-x-0");
    this.drawer.classList.add("translate-x-full");
    setTimeout(() => {
      this.classList.remove("visible");
      this.classList.add("invisible");
    }, 300);
    document.body.classList.remove("has-modal");
    this.focusTrap.deactivate();
    if (this.activeElement) {
      this.activeElement.focus();
      this.activeElement = null;
    }
  }
  async preloadSections() {
    var _a, _b;
    if ((_a = this.itemsContainer) == null ? void 0 : _a.dataset.loaded) return;
    try {
      const cartData = (_b = window.theme) == null ? void 0 : _b.cartData;
      if (!cartData || cartData.item_count === 0) {
        if (this.itemsContainer) {
          this.itemsContainer.dataset.loaded = "true";
        }
        return;
      }
      const sectionsUrl = `${window.location.pathname}?sections=cart-drawer-items,cart-drawer-footer`;
      const sectionsResponse = await fetch(sectionsUrl);
      const sections = await sectionsResponse.json();
      this.renderSections(sections);
    } catch (error) {
      console.error("Error preloading cart drawer sections:", error);
    }
  }
  async loadSections() {
    this.showLoading();
    try {
      const response = await fetch(`${window.theme.routes.cart_url}.js`);
      const cartData = await response.json();
      if (cartData.item_count === 0) {
        this.showEmpty();
        return;
      }
      const sectionsUrl = `${window.location.pathname}?sections=cart-drawer-items,cart-drawer-footer`;
      const sectionsResponse = await fetch(sectionsUrl);
      const sections = await sectionsResponse.json();
      this.renderSections(sections);
    } catch (error) {
      console.error("Error loading cart drawer sections:", error);
    } finally {
      this.hideLoading();
    }
  }
  async updateSections() {
    try {
      const response = await fetch(`${window.theme.routes.cart_url}.js`);
      const cartData = await response.json();
      if (cartData.item_count === 0) {
        this.showEmpty();
        return;
      }
      const sectionsUrl = `${window.location.pathname}?sections=cart-drawer-items,cart-drawer-footer`;
      const sectionsResponse = await fetch(sectionsUrl);
      const sections = await sectionsResponse.json();
      this.renderSections(sections);
    } catch (error) {
      console.error("Error updating cart drawer sections:", error);
    }
  }
  renderSections(sections) {
    var _a, _b, _c, _d, _e;
    if (sections["cart-drawer-items"]) {
      const parser = new DOMParser();
      const itemsDoc = parser.parseFromString(
        sections["cart-drawer-items"],
        "text/html"
      );
      const itemsContent = itemsDoc.querySelector("cart-drawer-items");
      if (itemsContent) {
        this.itemsContainer.replaceWith(itemsContent);
        this.itemsContainer = this.querySelector("#cart-drawer-items") || itemsContent;
        this.itemsContainer.dataset.loaded = "true";
      }
    }
    if (sections["cart-drawer-footer"]) {
      const parser = new DOMParser();
      const footerDoc = parser.parseFromString(
        sections["cart-drawer-footer"],
        "text/html"
      );
      const footerContent = footerDoc.querySelector(
        "#cart-drawer-footer-content"
      );
      if (footerContent) {
        this.footerContainer.innerHTML = footerContent.outerHTML;
        this.footerContainer.classList.remove("hidden");
      }
    }
    if (sections["cart-button"]) {
      const elements = document.querySelectorAll("#cart-button");
      elements.forEach((element) => {
        element.innerHTML = this.getSectionInnerHTML(
          sections["cart-button"],
          ".shopify-section"
        );
      });
    }
    if (sections["cart-icon-button"]) {
      const elements = document.querySelectorAll("#cart-icon-button");
      elements.forEach((element) => {
        element.innerHTML = this.getSectionInnerHTML(
          sections["cart-icon-button"],
          ".shopify-section"
        );
      });
    }
    (_a = this.emptyElement) == null ? void 0 : _a.classList.add("hidden");
    (_b = this.loadingElement) == null ? void 0 : _b.classList.add("hidden");
    (_c = this.loadingElement) == null ? void 0 : _c.classList.remove("flex");
    (_d = this.itemsContainer) == null ? void 0 : _d.classList.remove("hidden");
    (_e = this.footerContainer) == null ? void 0 : _e.classList.remove("hidden");
    this.updateCartCount();
  }
  getSectionInnerHTML(html, selector = ".shopify-section") {
    var _a;
    return (_a = new DOMParser().parseFromString(html, "text/html").querySelector(selector)) == null ? void 0 : _a.innerHTML;
  }
  async updateCartCount() {
    try {
      const response = await fetch(`${window.theme.routes.cart_url}.js`);
      const cartData = await response.json();
      const countElement = this.querySelector("[data-cart-count]");
      if (countElement) {
        countElement.textContent = cartData.item_count > 0 ? `(${cartData.item_count})` : "";
      }
    } catch (error) {
      console.error("Error updating cart count:", error);
    }
  }
  showLoading() {
    var _a, _b, _c, _d, _e;
    (_a = this.loadingElement) == null ? void 0 : _a.classList.remove("hidden");
    (_b = this.loadingElement) == null ? void 0 : _b.classList.add("flex");
    (_c = this.itemsContainer) == null ? void 0 : _c.classList.add("hidden");
    (_d = this.footerContainer) == null ? void 0 : _d.classList.add("hidden");
    (_e = this.emptyElement) == null ? void 0 : _e.classList.add("hidden");
  }
  hideLoading() {
    var _a, _b, _c, _d;
    (_a = this.loadingElement) == null ? void 0 : _a.classList.add("hidden");
    (_b = this.loadingElement) == null ? void 0 : _b.classList.remove("flex");
    (_c = this.itemsContainer) == null ? void 0 : _c.classList.remove("hidden");
    (_d = this.footerContainer) == null ? void 0 : _d.classList.remove("hidden");
  }
  showEmpty() {
    var _a, _b, _c, _d;
    (_a = this.emptyElement) == null ? void 0 : _a.classList.remove("hidden");
    (_b = this.itemsContainer) == null ? void 0 : _b.classList.add("hidden");
    (_c = this.footerContainer) == null ? void 0 : _c.classList.add("hidden");
    (_d = this.loadingElement) == null ? void 0 : _d.classList.add("hidden");
    const countElement = this.querySelector("[data-cart-count]");
    if (countElement) {
      countElement.textContent = "";
    }
  }
  setActiveElement(element) {
    this.activeElement = element;
  }
}
customElements.define("cart-drawer", CartDrawer);
