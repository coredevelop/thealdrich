import { c as createFocusTrap } from "vendors/focus-trap.esm";
import { S as Splide } from "vendors/splide.esm";
class MediaSlideshow extends HTMLElement {
  constructor() {
    super();
    this.slideshow = this.querySelector(".splide.media__main");
    this.slideshowList = this.slideshow.querySelector(".splide__list");
    this.slides = this.slideshow.querySelectorAll(".splide__slide");
    this.slideshowThumbnails = this.querySelector(".splide.media__thumbnails");
    this.mediaRatio = this.slideshow.dataset.mediaRatio;
    this.thumbnailPlacement = this.slideshow.dataset.thumbnailPlacement;
    this.imagesLoaded = false;
    this.mediaThumbnailsScrolling = this.querySelector(
      ".media__thumbnails--scrolling"
    );
    if (this.mediaThumbnailsScrolling) {
      this.mediaThumbnails = this.mediaThumbnailsScrolling.querySelectorAll(".media__thumbnail");
    }
    this.currentLightboxIndex = 0;
    this.lightboxImages = [];
    this.originalMainSlides = [];
    this.originalThumbnailSlides = [];
    this.originalThumbnailElements = [];
    this.removedSlides = /* @__PURE__ */ new Map();
    this.bindEvents();
    this.initSlideshow();
    if (theme.isTouchDevice()) return;
    const zoomEnabled = JSON.parse(this.dataset.zoom);
    const lightboxEnabled = JSON.parse(this.dataset.lightbox);
    if (zoomEnabled) {
      this.initZoom();
    }
    if (lightboxEnabled) {
      this.initLightbox();
    }
  }
  bindEvents() {
    if (this.mediaThumbnails) {
      this.mediaThumbnails.forEach((thumbnail) => {
        thumbnail.addEventListener(
          "click",
          (event) => this.selectThumbnail(event)
        );
      });
    }
  }
  initSlideshow() {
    this.slideshowOptions = JSON.parse(this.slideshow.dataset.options);
    switch (this.mediaRatio) {
      case "square":
        this.slideshowOptions.heightRatio = 1;
        break;
      case "portrait":
        this.slideshowOptions.heightRatio = 1.5;
        break;
      case "landscape":
        this.slideshowOptions.heightRatio = 0.75;
        break;
    }
    this.slides.forEach((slide, index) => {
      slide.setAttribute("data-slide-index", index);
    });
    this.main = new Splide(this.slideshow, this.slideshowOptions);
    this.main.on("move", (index, prev, dest) => {
      if (this.mediaRatio === "adapt") {
        let indexId = index + 1;
        if (indexId < 10) {
          indexId = `0${indexId}`;
        }
        const destSlide = this.slideshow.querySelector(
          `#${this.main.root.id}-slide${indexId}`
        );
        const destSlideImage = destSlide.querySelector(".product__media-image");
        this.slideshowList.style.height = `${destSlideImage.offsetHeight}px`;
      }
      if (!this.imagesLoaded) {
        this.loadImages();
      }
    });
    this.main.on("moved", (newIndex, prevIndex, destIndex) => {
      if (this.mediaThumbnailsScrolling) {
        const activeClass = "media__thumbnail--active";
        const prevActive = this.querySelector(`.${activeClass}`);
        const allThumbnails = this.mediaThumbnailsScrolling.querySelectorAll(".media__thumbnail");
        let visibleCount = 0;
        let targetThumbnail = null;
        allThumbnails.forEach((thumb) => {
          if (!thumb.classList.contains("hidden-thumbnail")) {
            if (visibleCount === newIndex) {
              targetThumbnail = thumb;
            }
            visibleCount++;
          }
        });
        if (prevActive) {
          prevActive.classList.remove(activeClass);
        }
        if (targetThumbnail) {
          targetThumbnail.classList.add(activeClass);
          targetThumbnail.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center"
          });
        }
      }
    });
    this.main.on("mounted", () => {
      if (this.mediaRatio === "adapt") {
        this.onResize();
        this.slideshow.querySelector(
          ".splide__slide.is-active"
        );
      }
      this.storeOriginalSlides();
    });
    if (this.slideshowThumbnails) {
      this.slideshowThumbnailsOptions = JSON.parse(
        this.slideshowThumbnails.dataset.options
      );
      this.thumbnails = new Splide(
        this.slideshowThumbnails,
        this.slideshowThumbnailsOptions
      );
      this.main.sync(this.thumbnails);
    }
    this.main.mount();
    if (this.slideshowThumbnails) {
      this.thumbnails.mount();
      if (this.dataset.hideVariants === "true") {
        const hiddenThumbSlides = this.slideshowThumbnails.querySelectorAll(".splide__slide.hidden");
        hiddenThumbSlides.forEach((slide) => slide.classList.remove("hidden"));
      }
      const track = this.slideshowThumbnails.querySelector(".splide__track");
      const list = this.slideshowThumbnails.querySelector(".splide__list");
      list.querySelectorAll(".splide__slide");
      const trackStyles = getComputedStyle(track);
      parseInt(trackStyles.marginLeft);
      parseInt(trackStyles.marginRight);
      this.thumbnailsContainer = this.querySelector(
        ".media__thumbnails-container"
      );
      this.mediaResizeObserver = new ResizeObserver((entries) => {
        const target = entries[0].target;
        const currentTrack = this.slideshowThumbnails.querySelector(".splide__track");
        const currentList = this.slideshowThumbnails.querySelector(".splide__list");
        const currentThumbnails = currentList.querySelectorAll(".splide__slide");
        const currentTrackStyles = getComputedStyle(currentTrack);
        const currentTrackMarginLeft = parseInt(currentTrackStyles.marginLeft);
        const currentTrackMarginRight = parseInt(
          currentTrackStyles.marginRight
        );
        let thumbnailsWidths = 0;
        currentThumbnails.forEach((thumbnail, index) => {
          const thumbnailStyles = getComputedStyle(thumbnail);
          let thumbMargin = 0;
          if (index + 1 !== currentThumbnails.length) {
            thumbMargin = parseFloat(thumbnailStyles.marginLeft) + parseFloat(thumbnailStyles.marginRight);
          }
          thumbnailsWidths = thumbnailsWidths + thumbnail.offsetWidth + thumbMargin;
        });
        const containerWidth = thumbnailsWidths + currentTrackMarginLeft + currentTrackMarginRight;
        if (containerWidth < target.offsetWidth) {
          this.thumbnailsContainer.style.width = `${containerWidth}px`;
          this.thumbnails.refresh();
        } else {
          this.thumbnailsContainer.style.width = "auto";
        }
      });
      this.mediaResizeObserver.observe(this);
      this.thumbnails.on("updated", () => {
        this.recalculateThumbnailContainerWidth();
      });
    }
    if (this.dataset.hideVariants === "true") {
      const hiddenMainSlides = this.slideshow.querySelectorAll(".splide__slide.hidden");
      hiddenMainSlides.forEach((slide) => slide.classList.remove("hidden"));
      if (this.mediaThumbnailsScrolling) {
        const hiddenThumbs = this.mediaThumbnailsScrolling.querySelectorAll(".media__thumbnail.hidden");
        hiddenThumbs.forEach((thumb) => thumb.classList.remove("hidden"));
      }
      this.removeSlides();
    }
  }
  initZoom() {
    const mediaSlides = [...this.slides].filter((slide) => {
      return slide.dataset.mediaType === "image";
    });
    const slideWidth = mediaSlides[0].offsetWidth;
    this.setAttribute("data-zoom-enabled", true);
    mediaSlides.forEach((slide) => {
      const media = slide.querySelector(".product__media-image");
      let maxZoomWidth = Number(media.dataset.width);
      if (maxZoomWidth > 1400) maxZoomWidth = 1400;
      if (slideWidth > maxZoomWidth) {
        slide.classList.add("zoom-disabled");
        return;
      }
      slide.style.backgroundImage = `url(${media.src})`;
      slide.addEventListener("mousemove", (event) => {
        const media2 = event.currentTarget.querySelector(
          ".product__media-image"
        );
        Number(media2.dataset.width);
        const zoomer = event.currentTarget;
        let offsetX;
        let offsetY;
        if (event.offsetX !== void 0) {
          offsetX = event.offsetX;
        } else if (event.touches && event.touches.length > 0) {
          offsetX = event.touches[0].pageX;
        }
        if (event.offsetY !== void 0) {
          offsetY = event.offsetY;
        } else if (event.touches && event.touches.length > 0) {
          offsetY = event.touches[0].pageY;
        }
        const x = offsetX / zoomer.offsetWidth * 100;
        const y = offsetY / zoomer.offsetHeight * 100;
        zoomer.style.backgroundPosition = `${x}% ${y}%`;
      });
    });
  }
  initLightbox() {
    const mediaSlides = [...this.slides].filter((slide) => {
      return slide.dataset.mediaType === "image";
    });
    this.lightboxImages = mediaSlides.map(
      (slide) => slide.querySelector(".product__media-image")
    );
    mediaSlides.forEach((slide, index) => {
      const media = slide.querySelector(".product__media-image");
      media.classList.add("cursor-pointer");
      media.addEventListener("click", (event) => {
        this.showLightbox(index);
      });
    });
    this.modal = this.querySelector(".modal");
    this.closeButton = this.querySelector(".modal__close");
    this.modalBackground = this.querySelector(".modal__background");
    this.modalContainer = this.querySelector(".modal__container");
    this.prevButton = document.createElement("button");
    this.prevButton.classList.add(
      "modal__nav",
      "modal__nav--prev",
      "absolute",
      "left-4",
      "top-1/2",
      "-translate-y-1/2",
      "z-50",
      "w-6",
      "h-6",
      "fill-current",
      "text-primary-background"
    );
    this.prevButton.innerHTML = `
      <span class="sr-only">${theme.strings.previous}</span>
      <svg aria-hidden="true" focusable="false" role="presentation" class="icon fill-current icon-ui-chevron-left" viewBox="0 0 320 512"><path d="M34.52 239.03 228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"></path></svg>
    `;
    this.nextButton = document.createElement("button");
    this.nextButton.classList.add(
      "modal__nav",
      "modal__nav--next",
      "absolute",
      "right-4",
      "top-1/2",
      "-translate-y-1/2",
      "z-50",
      "w-6",
      "h-6",
      "fill-current",
      "text-primary-background"
    );
    this.nextButton.innerHTML = `
      <span class="sr-only">${theme.strings.next}</span>
      <svg aria-hidden="true" focusable="false" role="presentation" class="icon fill-current icon-ui-chevron-right" viewBox="0 0 320 512"><path d="M285.476 272.971 91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path></svg>
    `;
    this.modal.appendChild(this.prevButton);
    this.modal.appendChild(this.nextButton);
    this.focusTrap = createFocusTrap(this.modal, {
      initialFocus: false
    });
    this.closeButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.closeLightbox();
    });
    this.modalBackground.addEventListener("click", (event) => {
      event.preventDefault();
      this.closeLightbox();
    });
    this.modalContainer.addEventListener("click", (event) => {
      event.preventDefault();
      this.closeLightbox();
    });
    this.addEventListener("keyup", (event) => {
      if (event.code.toUpperCase() !== "ESCAPE") return;
      this.closeLightbox();
    });
    this.prevButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.showPreviousLightboxImage();
    });
    this.nextButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.showNextLightboxImage();
    });
    this.modal.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        this.showPreviousLightboxImage();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        this.showNextLightboxImage();
      }
    });
  }
  showLightbox(index) {
    if (index < 0 || index >= this.lightboxImages.length) return;
    this.currentLightboxIndex = index;
    const image = this.lightboxImages[index];
    if (!image) return;
    const imageClone = image.cloneNode(true);
    imageClone.setAttribute("sizes", "100vw");
    imageClone.classList.remove("cursor-pointer");
    const modalContainer = this.modal.querySelector(".modal__container");
    modalContainer.replaceChildren(imageClone);
    document.body.classList.add("has-modal");
    this.modal.classList.add("modal--active");
    this.closeButton = this.querySelector(".modal__close");
    this.closeButton.focus();
    this.prevButton.classList.remove("hidden");
    this.nextButton.classList.remove("hidden");
    this.updateLightboxNavigation();
    this.focusTrap.activate();
  }
  showPreviousLightboxImage() {
    let newIndex = this.currentLightboxIndex - 1;
    if (newIndex < 0) newIndex = this.lightboxImages.length - 1;
    this.showLightbox(newIndex);
    this.main.go(newIndex);
  }
  showNextLightboxImage() {
    let newIndex = this.currentLightboxIndex + 1;
    if (newIndex >= this.lightboxImages.length) newIndex = 0;
    this.showLightbox(newIndex);
    this.main.go(newIndex);
  }
  updateLightboxNavigation() {
    this.prevButton.classList.toggle("hidden", this.currentLightboxIndex === 0);
    this.nextButton.classList.toggle(
      "hidden",
      this.currentLightboxIndex === this.lightboxImages.length - 1
    );
  }
  closeLightbox() {
    document.body.classList.remove("has-modal");
    this.modal.classList.remove("modal--active");
    this.focusTrap.deactivate();
  }
  disableDrag() {
    this.main.options = {
      drag: false,
      keyboard: false
    };
  }
  enableDrag() {
    this.main.options = {
      drag: true,
      keyboard: true
    };
  }
  selectThumbnail(event) {
    const activeClass = "media__thumbnail--active";
    const prevActive = this.querySelector(`.${activeClass}`);
    const active = event.currentTarget;
    const originalIndex = Number(active.dataset.index);
    const allThumbnails = this.mediaThumbnailsScrolling.querySelectorAll(".media__thumbnail");
    let visibleIndex = 0;
    let targetSlideIndex = 0;
    for (let i = 0; i <= originalIndex; i++) {
      if (allThumbnails[i] && !allThumbnails[i].classList.contains("hidden-thumbnail")) {
        if (i === originalIndex) {
          targetSlideIndex = visibleIndex;
        }
        visibleIndex++;
      }
    }
    prevActive.classList.remove(activeClass);
    active.classList.add(activeClass);
    this.main.go(targetSlideIndex);
  }
  reinitalize() {
    if (this.main) {
      this.main.destroy();
      this.main.mount();
      this.main.refresh();
    }
    if (this.thumbnails) {
      this.thumbnails.destroy();
      this.thumbnails.mount();
      this.thumbnails.refresh();
    }
    if (this.thumbnails && this.main) {
      this.main.sync(this.thumbnails);
    }
  }
  setActiveMedia(mediaId) {
    const activeSlide = this.querySelector(`[data-media-id="${mediaId}"]`);
    if (!activeSlide) return;
    const allSlides = this.slideshow.querySelectorAll(".splide__slide");
    let slideIndex = -1;
    allSlides.forEach((slide, index) => {
      if (slide.dataset.mediaId === mediaId) {
        slideIndex = index;
      }
    });
    if (slideIndex >= 0) {
      this.main.go(slideIndex);
    }
  }
  loadImages() {
    const images = this.slideshow.querySelectorAll("img");
    images.forEach((image) => {
      image.setAttribute("loading", "eager");
    });
    this.imagesLoaded = true;
  }
  onResize() {
    this.slideshowResizeObserver = new ResizeObserver((entries) => {
      const activeSlideImage = this.slideshow.querySelector(
        ".splide__slide.is-active .product__media-image"
      );
      if (this.main.state.is(Splide.STATES.IDLE)) {
        this.slideshowList.style.height = `${activeSlideImage.offsetHeight}px`;
      }
    });
    this.slideshowResizeObserver.observe(this.slideshow);
  }
  storeOriginalSlides() {
    const mainSlides = this.slideshow.querySelectorAll(".splide__slide");
    mainSlides.forEach((slide, index) => {
      this.originalMainSlides.push({
        element: slide.cloneNode(true),
        index,
        mediaId: slide.dataset.mediaId
      });
    });
    if (this.slideshowThumbnails) {
      const thumbnailSlides = this.slideshowThumbnails.querySelectorAll(".splide__slide");
      thumbnailSlides.forEach((slide, index) => {
        this.originalThumbnailSlides.push({
          element: slide.cloneNode(true),
          index
        });
      });
    }
    if (this.mediaThumbnailsScrolling) {
      const thumbnails = this.mediaThumbnailsScrolling.querySelectorAll(".media__thumbnail");
      thumbnails.forEach((thumb, index) => {
        this.originalThumbnailElements.push({
          element: thumb.cloneNode(true),
          index,
          originalDataIndex: thumb.dataset.index
        });
      });
    }
  }
  removeSlides(indicesToRemove = null) {
    if (!indicesToRemove) {
      indicesToRemove = [];
      const allSlides = this.slideshow.querySelectorAll(".splide__slide:not(.hidden)");
      allSlides.forEach((slide, index) => {
        if (slide.dataset.variantImage === "true" && slide.dataset.currentVariantImage === "false") {
          indicesToRemove.push(index);
        }
      });
    }
    if (indicesToRemove.length === 0) return;
    const currentIndex = this.main.index;
    const currentSlide = this.slideshow.querySelectorAll(".splide__slide")[currentIndex];
    const currentMediaId = currentSlide ? currentSlide.dataset.mediaId : null;
    indicesToRemove.forEach((index) => {
      if (index < this.originalMainSlides.length) {
        this.removedSlides.set(index, {
          main: this.originalMainSlides[index],
          thumbnail: this.originalThumbnailSlides ? this.originalThumbnailSlides[index] : null,
          thumbnailElement: this.originalThumbnailElements ? this.originalThumbnailElements[index] : null
        });
      }
    });
    const sortedIndices = [...indicesToRemove].sort((a, b) => b - a);
    sortedIndices.forEach((index) => {
      this.main.remove(index);
    });
    if (this.thumbnails && this.slideshowThumbnails) {
      sortedIndices.forEach((index) => {
        this.thumbnails.remove(index);
      });
    } else if (this.mediaThumbnailsScrolling) {
      const thumbnails = this.mediaThumbnailsScrolling.querySelectorAll(".media__thumbnail");
      const activeClass = "media__thumbnail--active";
      let activeThumbHidden = false;
      let nextVisibleIndex = -1;
      thumbnails.forEach((thumb, index) => {
        if (indicesToRemove.includes(index)) {
          thumb.style.display = "none";
          thumb.classList.add("hidden-thumbnail");
          if (thumb.classList.contains(activeClass)) {
            activeThumbHidden = true;
            thumb.classList.remove(activeClass);
          }
        } else if (activeThumbHidden && nextVisibleIndex === -1) {
          nextVisibleIndex = index;
        }
      });
      if (activeThumbHidden && nextVisibleIndex !== -1) {
        thumbnails[nextVisibleIndex].classList.add(activeClass);
      }
    }
    this.updateLightboxImages();
    this.main.refresh();
    if (this.thumbnails) {
      this.thumbnails.refresh();
    }
    if (currentMediaId) {
      const newSlides = this.slideshow.querySelectorAll(".splide__slide");
      newSlides.forEach((slide, index) => {
        if (slide.dataset.mediaId === currentMediaId) {
          this.main.go(index);
        }
      });
    }
    if (this.thumbnailsContainer) {
      setTimeout(() => {
        this.recalculateThumbnailContainerWidth();
      }, 50);
    }
  }
  addSlidesBack(slidesToAdd = null) {
    if (!slidesToAdd) {
      slidesToAdd = Array.from(this.removedSlides.keys());
    }
    if (slidesToAdd.length === 0 || this.removedSlides.size === 0) return;
    const currentIndex = this.main.index;
    const currentSlide = this.slideshow.querySelectorAll(".splide__slide")[currentIndex];
    const currentMediaId = currentSlide ? currentSlide.dataset.mediaId : null;
    const sortedIndices = slidesToAdd.sort((a, b) => a - b);
    sortedIndices.forEach((originalIndex) => {
      const slideData = this.removedSlides.get(originalIndex);
      if (!slideData) return;
      const existingSlide = this.slideshow.querySelector(
        `[data-media-id="${slideData.main.mediaId}"]`
      );
      if (!existingSlide) {
        this.main.add(slideData.main.element.cloneNode(true), originalIndex);
        if (this.thumbnails && this.slideshowThumbnails && slideData.thumbnail) {
          this.thumbnails.add(
            slideData.thumbnail.element.cloneNode(true),
            originalIndex
          );
        }
      }
    });
    sortedIndices.forEach((index) => {
      this.removedSlides.delete(index);
    });
    if (this.mediaThumbnailsScrolling) {
      sortedIndices.forEach((originalIndex) => {
        const thumbnails = this.mediaThumbnailsScrolling.querySelectorAll(".media__thumbnail");
        if (thumbnails[originalIndex]) {
          thumbnails[originalIndex].style.display = "";
          thumbnails[originalIndex].classList.remove("hidden-thumbnail");
        }
      });
    }
    const mainSlides = this.slideshow.querySelectorAll(".splide__slide");
    mainSlides.forEach((slide, index) => {
      slide.setAttribute("data-slide-index", index);
    });
    this.updateLightboxImages();
    this.main.refresh();
    if (this.thumbnails) {
      this.thumbnails.refresh();
    }
    if (currentMediaId) {
      const newSlides = this.slideshow.querySelectorAll(".splide__slide");
      newSlides.forEach((slide, index) => {
        if (slide.dataset.mediaId === currentMediaId) {
          this.main.go(index);
        }
      });
    }
    if (this.thumbnailsContainer) {
      setTimeout(() => {
        this.recalculateThumbnailContainerWidth();
      }, 50);
    }
  }
  updateLightboxImages() {
    const mediaSlides = [
      ...this.slideshow.querySelectorAll(".splide__slide")
    ].filter((slide) => {
      return slide.dataset.mediaType === "image";
    });
    this.lightboxImages = mediaSlides.map(
      (slide) => slide.querySelector(".product__media-image")
    );
  }
  recalculateThumbnailContainerWidth() {
    if (!this.thumbnailsContainer || !this.slideshowThumbnails) return;
    const track = this.slideshowThumbnails.querySelector(".splide__track");
    const list = this.slideshowThumbnails.querySelector(".splide__list");
    const thumbnails = list.querySelectorAll(".splide__slide");
    const trackStyles = getComputedStyle(track);
    const trackMarginLeft = parseInt(trackStyles.marginLeft);
    const trackMarginRight = parseInt(trackStyles.marginRight);
    let thumbnailsWidths = 0;
    thumbnails.forEach((thumbnail, index) => {
      const thumbnailStyles = getComputedStyle(thumbnail);
      let thumbMargin = 0;
      if (index + 1 !== thumbnails.length) {
        thumbMargin = parseFloat(thumbnailStyles.marginLeft) + parseFloat(thumbnailStyles.marginRight);
      }
      thumbnailsWidths = thumbnailsWidths + thumbnail.offsetWidth + thumbMargin;
    });
    const containerWidth = thumbnailsWidths + trackMarginLeft + trackMarginRight;
    if (containerWidth < this.offsetWidth) {
      this.thumbnailsContainer.style.width = `${containerWidth}px`;
    } else {
      this.thumbnailsContainer.style.width = "auto";
    }
    if (this.thumbnails) {
      this.thumbnails.refresh();
      setTimeout(() => {
        this.thumbnails.go(this.thumbnails.index);
      }, 10);
    }
  }
  updateVariantImages(currentVariant) {
    if (!currentVariant) return;
    const hideVariants = this.dataset.hideVariants === "true";
    const sectionId = this.id.replace("MediaSlideshow-", "");
    if (hideVariants) {
      const originalSpeed = this.main.options.speed || 300;
      this.main.options = { ...this.main.options, speed: 0 };
      this.originalMainSlides.forEach((slideData) => {
        const element = slideData.element;
        if (element.dataset.variantImage === "true") {
          element.dataset.currentVariantImage = "false";
          if (currentVariant.featured_media && element.dataset.mediaId === `${sectionId}-${currentVariant.featured_media.id}`) {
            element.dataset.currentVariantImage = "true";
          }
        }
      });
      if (this.originalThumbnailSlides.length > 0) {
        this.originalThumbnailSlides.forEach((slideData, index) => {
          const mainSlideData = this.originalMainSlides[index];
          if (mainSlideData && slideData.element) {
            slideData.element.dataset.variantImage = mainSlideData.element.dataset.variantImage;
            slideData.element.dataset.currentVariantImage = mainSlideData.element.dataset.currentVariantImage;
          }
        });
      }
      const slidesToAdd = [];
      this.removedSlides.forEach((slideData, index) => {
        const element = slideData.main.element;
        if (element.dataset.variantImage === "false" || element.dataset.currentVariantImage === "true") {
          slidesToAdd.push(index);
        }
      });
      if (slidesToAdd.length > 0) {
        this.addSlidesBack(slidesToAdd);
      }
      const currentSlides = this.slideshow.querySelectorAll(".splide__slide");
      currentSlides.forEach((slide) => {
        const originalSlide = this.originalMainSlides.find(
          (s) => s.mediaId === slide.dataset.mediaId
        );
        if (originalSlide) {
          slide.dataset.variantImage = originalSlide.element.dataset.variantImage;
          slide.dataset.currentVariantImage = originalSlide.element.dataset.currentVariantImage;
        }
      });
      this.removeSlides();
      setTimeout(() => {
        this.main.options = { ...this.main.options, speed: originalSpeed };
      }, 100);
    }
    const allSlides = this.slideshow.querySelectorAll(".splide__slide");
    allSlides.forEach((slide) => {
      if (slide.dataset.variantImage !== void 0) {
        slide.dataset.currentVariantImage = "false";
      }
    });
    if (currentVariant.featured_media && currentVariant.featured_media.id) {
      const currentSlide = this.slideshow.querySelector(
        `[data-media-id="${sectionId}-${currentVariant.featured_media.id}"]`
      );
      if (currentSlide && currentSlide.dataset.variantImage === "true") {
        currentSlide.dataset.currentVariantImage = "true";
      }
    }
    if (this.thumbnails && this.thumbnails.root) {
      const thumbnailSlides = this.thumbnails.root.querySelectorAll(".splide__slide");
      thumbnailSlides.forEach((slide, index) => {
        const mainSlide = allSlides[index];
        if (mainSlide && mainSlide.dataset.variantImage !== void 0) {
          slide.dataset.variantImage = mainSlide.dataset.variantImage;
          slide.dataset.currentVariantImage = mainSlide.dataset.currentVariantImage;
        }
      });
    }
    if (this.mediaThumbnailsScrolling) {
      const manualThumbnails = this.mediaThumbnailsScrolling.querySelectorAll(".media__thumbnail");
      manualThumbnails.forEach((thumb, index) => {
        const mainSlide = allSlides[index];
        if (mainSlide && mainSlide.dataset.variantImage !== void 0) {
          thumb.dataset.variantImage = mainSlide.dataset.variantImage;
          thumb.dataset.currentVariantImage = mainSlide.dataset.currentVariantImage;
        }
      });
    }
  }
}
customElements.define("media-slideshow", MediaSlideshow);
