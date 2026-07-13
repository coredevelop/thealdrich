class CartAgreement extends HTMLElement {
  constructor() {
    super();
    this.section = this.closest("[data-section-id]");
    this.checkoutButtons = this.section.querySelector(".cart-block__buttons");
    if (!this.checkoutButtons) return;
    this.checkbox = this.querySelector('input[type="checkbox"]');
    this.toggleCheckout(this.checkbox.checked);
    this.checkbox.addEventListener("change", (event) => {
      this.toggleCheckout(event.currentTarget.checked);
    });
  }
  toggleCheckout(checked) {
    if (checked === true) {
      this.checkoutButtons.classList.remove(
        "pointer-events-none",
        "opacity-50"
      );
    } else {
      this.checkoutButtons.classList.add("pointer-events-none", "opacity-50");
    }
  }
}
customElements.define("cart-agreement", CartAgreement);
