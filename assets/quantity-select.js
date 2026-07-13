class QuantitySelect extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector(".quantity__input");
    this.minus = this.querySelector('.quantity__button[name="minus"]');
    this.plus = this.querySelector('.quantity__button[name="plus"]');
    this.changeEvent = new Event("change", { bubbles: true });
    this.minus.addEventListener("click", (event) => {
      this.decreaseQuantity();
    });
    this.plus.addEventListener("click", (event) => {
      this.increaseQuantity();
    });
  }
  decreaseQuantity(event) {
    const previousValue = this.input.value;
    if (Number(this.input.value) == 1) return;
    this.input.value = Number(this.input.value) - 1;
    if (previousValue !== this.input.value)
      this.input.dispatchEvent(this.changeEvent);
  }
  increaseQuantity(event) {
    const previousValue = this.input.value;
    this.input.value = Number(this.input.value) + 1;
    if (previousValue !== this.input.value)
      this.input.dispatchEvent(this.changeEvent);
  }
}
customElements.define("quantity-select", QuantitySelect);
