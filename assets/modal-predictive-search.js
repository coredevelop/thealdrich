import { c as createFocusTrap } from "vendors/focus-trap.esm";
class ModalPredictiveSearch extends HTMLElement {
  constructor() {
    super();
    this.searchButtons = document.querySelectorAll(
      'button[aria-controls="ModalPredictiveSearch"]'
    );
    this.overlay = this.querySelector(".predictive__overlay");
    this.searchButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        this.activeSearchButton = event.target;
        this.openModal();
      });
    });
    this.overlay.addEventListener("click", () => this.closeModal());
    this.focusTrap = createFocusTrap(this, {
      initialFocus: false,
      escapeDeactivates: false
    });
  }
  openModal() {
    this.setAttribute("aria-modal", "true");
    this.focusTrap.activate();
    const predictiveInput = this.querySelector(".predictive__input");
    if (predictiveInput) predictiveInput.focus();
  }
  closeModal() {
    this.setAttribute("aria-modal", "false");
    this.focusTrap.deactivate();
  }
}
customElements.define("modal-predictive-search", ModalPredictiveSearch);
