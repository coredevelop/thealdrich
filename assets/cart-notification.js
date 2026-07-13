import { c as createFocusTrap } from "vendors/focus-trap.esm";
class CartNotification extends HTMLElement {
  constructor() {
    super();
    this.cartButton = document.getElementById("cart-button");
    this.notification = this;
    this.sectionId = this.dataset.sectionId;
    this.continueButton = this.querySelector(".cart-notification__continue");
    this.onBodyClick = this.handleBodyClick.bind(this);
    this.focusTrap = createFocusTrap(this.notification, {
      allowOutsideClick: true
    });
    this.bindEvents();
  }
  bindEvents() {
    this.addEventListener("keyup", (event) => {
      if (event.code.toUpperCase() !== "ESCAPE") return;
      this.close();
    });
    this.querySelectorAll('button[type="button"]').forEach((closeButton) => {
      closeButton.addEventListener("click", (event) => {
        this.close();
      });
    });
  }
  open() {
    this.notification.classList.add("cart-notification--active");
    this.notification.focus();
    this.focusTrap.activate();
    document.body.addEventListener("click", this.onBodyClick);
    this.querySelector(".cart-notification__continue").addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        this.close();
      }
    );
  }
  close() {
    this.notification.classList.remove("cart-notification--active");
    document.body.removeEventListener("click", this.onBodyClick);
    this.focusTrap.deactivate();
    this.activeElement.focus();
  }
  handleBodyClick(event) {
    const target = event.target;
    if (target !== this.notification && !target.closest("cart-notification")) {
      this.close();
    }
  }
  setActiveElement(element) {
    this.activeElement = element;
  }
  getSectionsToRender() {
    return [
      {
        id: "cart-notification-product",
        selector: `#cart-notification-product-${this.productId}`
      },
      {
        id: "cart-notification-links"
      },
      {
        id: "cart-button"
      },
      {
        id: "cart-icon-button"
      }
    ];
  }
  renderContents(response) {
    this.productId = response.id;
    this.getSectionsToRender().forEach((section) => {
      const elements = document.querySelectorAll(`#${section.id}`);
      if (!elements.length) return;
      elements.forEach((element) => {
        element.innerHTML = this.getSectionInnerHTML(
          response.sections[section.id],
          section.selector
        );
      });
    });
    this.open();
  }
  getSectionInnerHTML(html, selector = ".shopify-section") {
    return new DOMParser().parseFromString(html, "text/html").querySelector(selector).innerHTML;
  }
}
customElements.define("cart-notification", CartNotification);
