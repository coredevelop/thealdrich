import { c as createFocusTrap } from "vendors/focus-trap.esm";
class LooksItem extends HTMLElement {
  constructor() {
    super();
    this.enablePopup = JSON.parse(this.dataset.enablePopup);
    if (!this.enablePopup) return;
    this.link = this.querySelector("a.looks__image-container");
    this.firstProduct = this.dataset.firstProduct;
    this.secondProduct = this.dataset.secondProduct;
    this.products = [];
    if (this.firstProduct) {
      this.products.push(this.firstProduct);
    }
    if (this.secondProduct) {
      this.products.push(this.secondProduct);
    }
    this.bindEvents();
    this.looksModal = this.querySelector("looks-modal");
    this.focusTrap = createFocusTrap(this.looksModal, {
      initialFocus: false
    });
    console.log("looks item", this, this.products);
  }
  bindEvents() {
    this.link.addEventListener("click", (event) => {
      if (this.enablePopup) {
        this.showModal();
        event.preventDefault();
      }
    });
    this.closeButton = this.querySelector(".modal__close");
    this.modalBackground = this.querySelector(".modal__background");
    this.closeButton.addEventListener("click", (event) => {
      this.hideModal();
      event.preventDefault();
    });
    this.modalBackground.addEventListener("click", (event) => {
      this.hideModal();
      event.preventDefault();
    });
    this.addEventListener("keyup", (event) => {
      if (event.code.toUpperCase() !== "ESCAPE") return;
      this.hideModal();
    });
  }
  showModal() {
    document.body.classList.add("has-modal");
    this.looksModal.classList.add("modal--active");
    if (this.looksModal.dataset.productsLoaded === void 0 && this.products.length > 0) {
      this.renderProductCards();
    }
    this.focusTrap.activate();
  }
  hideModal() {
    document.body.classList.remove("has-modal");
    this.looksModal = this.querySelector("looks-modal");
    this.looksModal.classList.remove("modal--active");
    this.focusTrap.deactivate();
  }
  renderProductCards() {
    this.products.forEach((productHandle) => {
      fetch(`/products/${productHandle}?section_id=product-card`).then((response) => response.text()).then((responseText) => {
        `LooksProductCard-${this.dataset.id}`;
        const html = new DOMParser().parseFromString(
          responseText,
          "text/html"
        );
        const template = html.querySelector(".shopify-section");
        const destination = this.querySelector(".looks__modal-products");
        if (template && destination)
          destination.appendChild(template.firstChild);
        this.looksModal.dataset.productsLoaded = true;
      });
    });
  }
}
customElements.define("looks-item", LooksItem);
