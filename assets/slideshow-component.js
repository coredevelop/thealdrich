import { i as isInView, a as isOutOfView } from "vendors/index.es";
import { l } from "vendors/index.esm";
import { S as Splide } from "vendors/splide.esm";
import { v as vidim } from "vendors/vidim";
class SlideshowComponent extends HTMLElement {
  constructor() {
    super();
    this.slideshow = this.querySelector(".splide");
    this.slideshowList = this.slideshow.querySelector(".splide__list");
    this.initSlideshow();
  }
  initSlideshow() {
    this.options = JSON.parse(this.slideshow.dataset.options);
    this.slideCount = this.slideshow.querySelectorAll(".splide__slide").length;
    const videoSlides = this.slideshow.querySelectorAll(
      '.splide__slide[data-type="video"]'
    );
    if (videoSlides.length > 0) {
      this.options.type = "slide";
      this.options.rewind = true;
    }
    if (this.options.size <= 1) {
      if (videoSlides.length > 0) {
        const videoSlide = this.slideshow.querySelector(".splide__slide");
        this.initSlideVideo(videoSlide);
      }
      return;
    }
    this.Splide = new Splide(this.slideshow, this.options);
    this.Splide.on("moved", (index, prev, dest) => {
      let indexId = index + 1;
      if (indexId < 10) {
        indexId = `0${indexId}`;
      }
      const destSlide = this.slideshow.querySelector(
        `#${this.Splide.root.id}-slide${indexId}`
      );
      const destSlideImage = destSlide.querySelector(".slide__image");
      this.slideshowList.style.height = `${destSlideImage.offsetHeight}px`;
      if (destSlide.getAttribute("data-type") === "video") {
        this.initSlideVideo(destSlide);
      }
    });
    this.Splide.on("ready", () => {
      this.onResize();
      const activeSlide = this.slideshow.querySelector(
        ".splide__slide.is-active"
      );
      if (!activeSlide) return;
      if (activeSlide.getAttribute("data-type") === "video") {
        this.initSlideVideo(activeSlide);
      }
    });
    this.Splide.on("overflow", (isOverflow) => {
      if (this.slideCount != 1) {
        this.slideshow.classList.add("is-overflow");
      }
    });
    this.Splide.mount();
    this.bindEditorEvents();
  }
  onResize() {
    this.slideshowResizeObserver = new ResizeObserver((entries) => {
      const activeSlideImage = this.slideshow.querySelector(
        ".splide__slide.is-active .slide__image"
      );
      if (this.Splide.state.is(Splide.STATES.IDLE)) {
        this.slideshowList.style.height = `${activeSlideImage.offsetHeight}px`;
      }
    });
    this.slideshowResizeObserver.observe(this.slideshow);
  }
  loadYouTubeAPI() {
    if (window.YT !== void 0) {
      theme.youTubeApiStatus = "ready";
    }
    if (theme.youTubeApiStatus !== "loaded" || theme.youTubeApiStatus !== "ready") {
      const script = document.createElement("script");
      script.id = `youtube-iframe-api`;
      script.src = `https://www.youtube.com/iframe_api`;
      script.async = true;
      script.onload = async () => {
        await l(() => window.YT.Player !== void 0, {
          timeout: 1e4
        });
        theme.youTubeApiStatus = "loaded";
      };
      document.body.append(script);
    }
  }
  async initSlideVideo(slide) {
    if (slide.dataset.videoLoaded === "true") return;
    const videoSlideHTML = `<div class="slide__video [&_video]:object-cover absolute inset-0 z-20"></div>`;
    const slideContain = slide.querySelector(".slide__contain");
    slideContain.insertAdjacentHTML("beforeend", videoSlideHTML);
    const videoSlide = slide.querySelector(".slide__video");
    let videoSlideBackground;
    const isMp4 = slide.dataset.videoMp4 ? true : false;
    if (theme.youTubeApiStatus !== "loaded" && !isMp4) {
      this.loadYouTubeAPI();
      await l(() => theme.youTubeApiStatus === "loaded", {
        timeout: 1e4
      });
      const videoId = slide.dataset.videoId;
      videoSlideBackground = new vidim(videoSlide, {
        type: "YouTube",
        src: videoId
      });
      videoSlideBackground.once("ready", function() {
        this.container.style.opacity = 0;
        this.play();
        inViewEvents();
      });
    } else {
      videoSlideBackground = new vidim(videoSlide, {
        src: [
          {
            type: "video/mp4",
            src: slide.dataset.videoMp4
          }
        ]
      });
      inViewEvents();
    }
    function inViewEvents() {
      const options = {
        threshold: 1e-3
      };
      isInView(
        slide,
        (target) => {
          videoSlideBackground.play();
        },
        options
      );
      isOutOfView(
        slide,
        (target) => {
          videoSlideBackground.pause();
        },
        options
      );
    }
    videoSlideBackground.on("play", function() {
      const container = this.container;
      const showDelay = 200;
      window.setTimeout(function() {
        container.style.opacity = 1;
      }, showDelay);
    });
    slide.dataset.videoLoaded = "true";
  }
  bindEditorEvents() {
    const { Autoplay } = this.Splide.Components;
    document.addEventListener("shopify:block:select", (event) => {
      const blockId = event.detail.blockId;
      const selectedBlock = this.slideshow.querySelector(
        `[data-block-id="${blockId}"]`
      );
      if (selectedBlock) {
        const slideIndex = Number(selectedBlock.dataset.slideIndex);
        this.Splide.go(slideIndex);
      }
    });
    document.addEventListener("shopify:section:select", (event) => {
      Autoplay.pause();
    });
    document.addEventListener("shopify:section:deselect", (event) => {
      Autoplay.play();
    });
  }
}
customElements.define("slideshow-component", SlideshowComponent);
