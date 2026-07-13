import { S as Splide } from "vendors/splide.esm";
class CollectionSliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector(".splide");
    this.sliderList = this.slider.querySelector(".splide__list");
    this.options = JSON.parse(this.slider.dataset.options);
    this.Splide = new Splide(this.slider, this.options);
    this.Splide.on("mounted", () => this.onResize());
    this.Splide.on("overflow", (isOverflow) => {
      if (this.Splide.slideCount != 1) {
        this.slider.classList.add("is-overflow");
      }
    });
    this.Splide.mount();
  }
  onResize() {
    this.sliderResizeObserver = new ResizeObserver(() => {
      this.resizeHeight();
    });
    this.sliderResizeObserver.observe(this.slider);
  }
  resizeHeight() {
    let maxProducCardHeight = 0;
    const visibleSlides = this.slider.querySelectorAll(
      ".splide__slide.is-visible"
    );
    visibleSlides.forEach((slide) => {
      const productCard = slide.querySelector(".product-card");
      if (productCard.clientHeight > maxProducCardHeight) {
        maxProducCardHeight = productCard.clientHeight;
      }
    });
    this.sliderList.style.height = `${maxProducCardHeight}px`;
  }
}
customElements.define("collection-slider-component", CollectionSliderComponent);
