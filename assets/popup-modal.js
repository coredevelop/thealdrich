import { c as createFocusTrap } from "vendors/focus-trap.esm";
import { a as api } from "vendors/js.cookie";
class PopupModal extends HTMLElement {
  constructor() {
    super();
    this.originalZIndex = 500;
    this.openZIndex = 1e3;
    this.promoSection = this.closest(".section__promos");
    this.blockType = this.dataset.blockType;
    this.blockId = this.dataset.blockId;
    this.focusTrap = createFocusTrap(this, {
      initialFocus: false
    });
    this.delay = this.dataset.delay;
    this.homepageLimit = JSON.parse(this.dataset.homepageLimit);
    this.visitorLimit = JSON.parse(this.dataset.visitorLimit);
    this.showFor = this.dataset.showFor;
    if (Shopify.designMode) {
      return;
    }
    if (api.get(`${this.blockType}-${this.blockId}`) !== void 0) {
      return;
    }
    if (this.homepageLimit == true && theme.pageType !== "index") {
      return;
    }
    if (this.visitorLimit == true && theme.customer) {
      return;
    }
    setTimeout(() => {
      if (this.showFor === "desktop" && window.innerWidth < theme.mobileBreakpoint) {
        return;
      }
      if (this.showFor === "mobile" && window.innerWidth >= theme.mobileBreakpoint) {
        return;
      }
      this.bindEvents();
      this.showModal();
    }, this.delay);
  }
  bindEvents() {
    this.closeButton = this.querySelector(".modal__close");
    this.modalBackground = this.querySelector(".modal__background");
    this.form = this.querySelector("form");
    this.closeButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.hideModal();
      const expireDays = 60;
      api.set(`${this.blockType}-${this.blockId}`, "close", {
        expires: expireDays
      });
    });
    this.modalBackground.addEventListener("click", (event) => {
      event.preventDefault();
      this.hideModal();
      const expireDays = 60;
      api.set(`${this.blockType}-${this.blockId}`, "close", {
        expires: expireDays
      });
    });
    this.addEventListener("keyup", (event) => {
      if (event.code.toUpperCase() !== "ESCAPE") return;
      this.hideModal();
      const expireDays = 60;
      api.set(`${this.blockType}-${this.blockId}`, "close", {
        expires: expireDays
      });
    });
    if (this.form) {
      this.form.addEventListener("submit", (event) => {
        const expireDays = 365;
        api.set(`${this.blockType}-${this.blockId}`, "submit", {
          expires: expireDays
        });
      });
    }
  }
  showModal() {
    document.body.classList.add("has-modal");
    this.promoSection.style.zIndex = this.openZIndex;
    this.classList.add("modal--active");
    this.closeButton = this.querySelector(".modal__close");
    this.closeButton.focus();
    this.focusTrap.activate();
  }
  hideModal() {
    document.body.classList.remove("has-modal");
    this.classList.remove("modal--active");
    this.focusTrap.deactivate();
  }
}
customElements.define("popup-modal", PopupModal);
