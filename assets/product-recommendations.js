class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
    this.url = this.dataset.url;
    if (!this.url) return;
    this.fetchRecommendations();
  }
  fetchRecommendations() {
    fetch(this.url).then((response) => response.text()).then((text) => {
      const sectionInnerHTML = new DOMParser().parseFromString(text, "text/html").querySelector(".shopify-section");
      const container = sectionInnerHTML.querySelector(
        ".product-recommendations__container"
      );
      if (container) {
        this.innerHTML = container.outerHTML;
        const parentComplementaryContainer = this.closest(
          ".product-complementary__container"
        );
        if (parentComplementaryContainer) {
          parentComplementaryContainer.classList.remove("hidden");
        }
      }
    }).catch((e) => {
      console.error(e);
    });
  }
}
customElements.define("product-recommendations", ProductRecommendations);
