class FundGallery extends HTMLElement {
  connectedCallback() {
    if (this.initialized) return;

    this.section = this.closest('[data-fund-gallery-root]');
    this.dialog = this.querySelector('[data-fund-gallery-dialog]');
    this.image = this.querySelector('[data-fund-gallery-image]');
    this.caption = this.querySelector('[data-fund-gallery-caption]');
    this.counter = this.querySelector('[data-fund-gallery-counter]');
    this.previousButton = this.querySelector('[data-fund-gallery-previous]');
    this.nextButton = this.querySelector('[data-fund-gallery-next]');
    this.closeButton = this.querySelector('[data-fund-gallery-close]');

    if (!this.section || !this.dialog || !this.image) return;

    this.triggers = Array.from(
      this.section.querySelectorAll('[data-fund-gallery-trigger]')
    );

    this.triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => this.open(trigger));
    });

    this.previousButton?.addEventListener('click', () => this.showPrevious());
    this.nextButton?.addEventListener('click', () => this.showNext());
    this.closeButton?.addEventListener('click', () => this.close());
    this.dialog.addEventListener('click', (event) => {
      if (
        event.target.matches(
          '[data-fund-gallery-dialog], [data-fund-gallery-surface], [data-fund-gallery-figure]'
        )
      ) {
        this.close();
      }
    });
    this.dialog.addEventListener('keydown', (event) => this.onKeydown(event));
    this.dialog.addEventListener('close', () => this.onClose());

    this.initialized = true;
  }

  open(trigger) {
    const group = trigger.dataset.fundGalleryGroup;
    this.galleryItems = this.triggers.filter(
      (item) => item.dataset.fundGalleryGroup === group
    );
    this.currentIndex = this.galleryItems.indexOf(trigger);
    this.returnFocus = trigger;
    this.update();

    document.documentElement.classList.add('fund-gallery-open');
    if (!this.dialog.open) this.dialog.showModal();
    this.closeButton?.focus();
  }

  update() {
    const item = this.galleryItems?.[this.currentIndex];
    if (!item) return;

    this.image.src = item.dataset.fundGallerySrc;
    this.image.alt = item.dataset.fundGalleryAlt || '';
    this.image.width = Number(item.dataset.fundGalleryWidth) || 1;
    this.image.height = Number(item.dataset.fundGalleryHeight) || 1;
    this.caption.textContent = item.dataset.fundGalleryCaption || '';
    this.counter.textContent = `${this.currentIndex + 1} / ${this.galleryItems.length}`;

    const hasMultipleImages = this.galleryItems.length > 1;
    this.previousButton.hidden = !hasMultipleImages;
    this.nextButton.hidden = !hasMultipleImages;
  }

  showPrevious() {
    this.currentIndex =
      (this.currentIndex - 1 + this.galleryItems.length) % this.galleryItems.length;
    this.update();
  }

  showNext() {
    this.currentIndex = (this.currentIndex + 1) % this.galleryItems.length;
    this.update();
  }

  onKeydown(event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.showPrevious();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.showNext();
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.currentIndex = 0;
      this.update();
    } else if (event.key === 'End') {
      event.preventDefault();
      this.currentIndex = this.galleryItems.length - 1;
      this.update();
    }
  }

  close() {
    if (this.dialog.open) this.dialog.close();
  }

  onClose() {
    document.documentElement.classList.remove('fund-gallery-open');
    this.returnFocus?.focus();
  }
}

if (!customElements.get('fund-gallery')) {
  customElements.define('fund-gallery', FundGallery);
}
