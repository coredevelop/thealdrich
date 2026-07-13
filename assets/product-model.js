class ProductModel extends HTMLElement {
  constructor() {
    super();
    this.coverButton = this.querySelector(".product-model__cover-button");
    this.mediaType = this.dataset.mediaType;
    this.loaded = JSON.parse(this.dataset.loaded);
    if (!this.coverButton) return;
    this.coverButton.addEventListener("click", () => this.loadContent());
  }
  loadContent() {
    theme.pauseAllMedia();
    if (!this.loaded) {
      const content = document.createElement("div");
      content.appendChild(this.querySelector("template").content.firstElementChild.cloneNode(true));
      const deferredElement = this.appendChild(content.querySelector("video, model-viewer, iframe"));
      deferredElement.focus();
      this.dataset.loaded = true;
    }
    Shopify.loadFeatures([
      {
        name: "model-viewer-ui",
        version: "1.0",
        onLoad: this.setupModelViewerUI.bind(this)
      }
    ]);
    if (!this.modelViewer) {
      this.modelViewer = this.querySelector("model-viewer");
    }
    if (!this.mutationObserver) {
      this.mutationObserver = new MutationObserver(() => {
        this.watchModelViewer();
      });
      this.mutationObserver.observe(this.modelViewer, {
        attributeFilter: ["class"]
      });
      this.manageSlider();
    }
  }
  watchModelViewer() {
    this.manageSlider();
  }
  manageSlider() {
    this.mediaSlideshow = this.closest("media-slideshow");
    if (this.modelViewer.classList.contains("shopify-model-viewer-ui__disabled")) {
      this.mediaSlideshow.enableDrag();
    } else {
      this.mediaSlideshow.disableDrag();
    }
  }
  setupModelViewerUI(errors) {
    if (errors) return;
    this.modelViewerUI = new Shopify.ModelViewerUI(
      this.querySelector("model-viewer")
    );
    if (!this.modelViewer) {
      this.modelViewer = this.querySelector("model-viewer");
    }
    this.modelViewer.focus();
  }
}
customElements.define("product-model", ProductModel);
window.ProductModel = {
  loadShopifyXR() {
    Shopify.loadFeatures([
      {
        name: "shopify-xr",
        version: "1.0",
        onLoad: this.setupShopifyXR.bind(this)
      }
    ]);
  },
  setupShopifyXR(errors) {
    if (errors) return;
    if (!window.ShopifyXR) {
      document.addEventListener(
        "shopify_xr_initialized",
        () => this.setupShopifyXR()
      );
      return;
    }
    document.querySelectorAll('[id^="ProductJSON-"]').forEach((modelJSON) => {
      window.ShopifyXR.addModels(JSON.parse(modelJSON.textContent));
      modelJSON.remove();
    });
    window.ShopifyXR.setupXRElements();
  }
};
if (window.ProductModel) window.ProductModel.loadShopifyXR();
