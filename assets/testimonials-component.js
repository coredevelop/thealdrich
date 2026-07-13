import { S as Splide } from "vendors/splide.esm";
class TestimonialsComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector(".splide");
    this.sliderList = this.slider.querySelector(".splide__list");
    this.options = JSON.parse(this.slider.dataset.options);
    this.Splide = new Splide(this.slider, this.options);
    this.Splide.on("overflow", (isOverflow) => {
      if (this.slideCount != 1) {
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
    let maxTestimonialHeight = 0;
    const visibleSlides = this.slider.querySelectorAll(
      ".splide__slide.is-visible"
    );
    visibleSlides.forEach((slide) => {
      const testimonial = slide.querySelector(".testimonial");
      if (testimonial.clientHeight > maxTestimonialHeight) {
        maxTestimonialHeight = testimonial.clientHeight;
      }
    });
    this.sliderList.style.height = `${maxTestimonialHeight}px`;
  }
}
customElements.define("testimonials-component", TestimonialsComponent);
