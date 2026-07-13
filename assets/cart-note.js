class CartNote extends HTMLElement {
  constructor() {
    super();
    this.addEventListener(
      "change",
      this.debounce((event) => {
        const body = JSON.stringify({ note: event.target.value });
        fetch(`${theme.routes.cart_update_url}`, {
          ...theme.fetchConfig(),
          ...{ body }
        });
      }, 300)
    );
  }
  debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
}
customElements.define("cart-note", CartNote);
