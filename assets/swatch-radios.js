class SwatchRadios extends HTMLElement {
  constructor() {
    super();
    this.productCard = this.closest("product-card");
    this.productLink = this.productCard.querySelector(".product-card__title");
    this.productImage = this.productCard.querySelector(
      ".product-card__featured-image"
    );
    this.swatchInputs = this.querySelectorAll('input[type="radio"]');
    this.imagesPreloaded = false;
    this.addEventListener("change", this.onSwatchChange);
    SwatchRadios.interaction("click,touchstart,mouseenter,focusin", this.productCard).then(() => this.preloadSwatchImages());
  }
  onSwatchChange(event) {
    this.selected = event.target;
    this.selectedVariantUrl = this.selected.dataset.variantUrl;
    this.selectedVariantImage = this.selected.dataset.variantImage;
    if (this.selectedVariantImage) {
      this.updateImage();
    }
    this.updateLinks();
  }
  updateImage() {
    if (this.productImage) {
      this.productImage.src = this.selectedVariantImage;
      this.productImage.srcset = "";
      this.productImage.sizes = "";
    }
  }
  updateLinks() {
    if (this.productLink) {
      this.productLink.setAttribute("href", this.selectedVariantUrl);
    }
  }
  preloadSwatchImages() {
    if (this.imagesPreloaded) return;
    this.swatchInputs.forEach((input) => {
      const variantImage = input.dataset.variantImage;
      if (variantImage) {
        const img = new Image();
        img.src = variantImage;
      }
    });
    this.imagesPreloaded = true;
  }
  static interaction(eventOverrides, el) {
    let events = ["click", "touchstart"];
    if (eventOverrides) {
      events = (eventOverrides || "").split(",").map((entry) => entry.trim());
    }
    return new Promise((resolve) => {
      function resolveFn() {
        resolve();
        for (let name of events) {
          el.removeEventListener(name, resolveFn);
        }
      }
      for (let name of events) {
        el.addEventListener(name, resolveFn, { once: true });
      }
    });
  }
}
customElements.define("swatch-radios", SwatchRadios);
