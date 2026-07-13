import { c as createFocusTrap } from "vendors/focus-trap.esm";
class PickupAvailabilityDrawer extends HTMLElement {
  constructor() {
    super();
    this.modalBackground = this.querySelector(".modal__background");
    this.modalClose = this.querySelector(".modal__close");
    this.focusTrap = createFocusTrap(this, {
      initialFocus: false
    });
    this.bindEvents();
  }
  bindEvents() {
    this.modalBackground.addEventListener("click", (event) => this.hide(event));
    this.modalClose.addEventListener("click", (event) => this.hide(event));
    this.addEventListener("keyup", (event) => this.menuKeyUp(event));
  }
  menuKeyUp(event) {
    if (event.code.toUpperCase() !== "ESCAPE") return;
    this.hide(event);
  }
  hide() {
    this.setAttribute("aria-expanded", false);
    this.removeAttribute("open");
    document.body.classList.remove("has-modal");
    this.focusTrap.deactivate();
    if (this.previousFocusElement) this.previousFocusElement.focus();
  }
  show(focusElement) {
    this.previousFocusElement = focusElement;
    this.setAttribute("aria-expanded", true);
    this.setAttribute("open", true);
    document.body.classList.add("has-modal");
    this.modalClose.focus();
    this.focusTrap.activate();
  }
}
customElements.define("pickup-availability-drawer", PickupAvailabilityDrawer);
