import { c as createFocusTrap } from "vendors/focus-trap.esm";
class ProductDetailsModal extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector('button[aria-haspopup="dialog"]');
    this.modal = this.querySelector(".modal");
    this.closeButton = this.querySelector(".modal__close");
    this.modalBackground = this.querySelector(".modal__background");
    this.modal.setAttribute("aria-hidden", "true");
    this.button.setAttribute("aria-expanded", "false");
    this.button.setAttribute("aria-controls", this.modal.id);
    this.focusTrap = createFocusTrap(this.modal, {
      initialFocus: false
    });
    this.bindEvents();
  }
  bindEvents() {
    this.button.addEventListener("click", (event) => {
      event.preventDefault();
      this.showModal();
    });
    this.closeButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.hideModal();
    });
    this.modalBackground.addEventListener("click", (event) => {
      event.preventDefault();
      this.hideModal();
    });
    this.addEventListener("keyup", (event) => {
      if (event.code.toUpperCase() !== "ESCAPE") return;
      this.hideModal();
    });
  }
  showModal() {
    document.body.classList.add("has-modal");
    this.modal.classList.add("modal--active");
    this.modal.setAttribute("aria-hidden", "false");
    this.button.setAttribute("aria-expanded", "true");
    const form = this.modal.querySelector("form");
    if (form) {
      const firstVisibleInput = form.querySelector(
        'input:not([type="hidden"]):not([style*="display:none"]), select:not([style*="display:none"]), textarea:not([style*="display:none"])'
      );
      if (firstVisibleInput) {
        firstVisibleInput.focus();
      } else {
        form.focus();
      }
    } else {
      this.closeButton = this.querySelector(".modal__close");
      this.closeButton.focus();
    }
    this.focusTrap.activate();
  }
  hideModal() {
    document.body.classList.remove("has-modal");
    this.modal.classList.remove("modal--active");
    this.modal.setAttribute("aria-hidden", "true");
    this.button.setAttribute("aria-expanded", "false");
    this.focusTrap.deactivate();
    this.button.focus();
  }
}
customElements.define("product-details-modal", ProductDetailsModal);
export {
  ProductDetailsModal as default
};
