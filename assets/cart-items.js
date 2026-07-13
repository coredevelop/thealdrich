class CartItems extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector(".cart-items__form");
    this.emptyMessage = this.querySelector(".cart-items__empty");
    this.lineItemStatusElement = document.getElementById(
      "shopping-cart-line-item-status"
    );
    this.currentItemCount = Array.from(
      this.querySelectorAll('[name="updates[]"]')
    ).reduce(
      (total, quantityInput) => total + parseInt(quantityInput.value),
      0
    );
    this.debouncedOnChange = this.debounce((event) => {
      this.onChange(event);
    }, 300);
    this.addEventListener("change", this.debouncedOnChange.bind(this));
  }
  onChange(event) {
    this.updateQuantity(
      event.target.dataset.index,
      event.target.value,
      document.activeElement.getAttribute("name"),
      event.target.dataset.quantityVariantId
    );
  }
  getSectionsToRender() {
    return [
      {
        id: "main-cart-items",
        section: document.getElementById("main-cart-items").dataset.sectionId,
        selector: ".cart-items__products"
      },
      {
        id: "cart-button",
        section: "cart-button",
        selector: ".shopify-section"
      },
      {
        id: "cart-icon-button",
        section: "cart-icon-button",
        selector: ".shopify-section"
      },
      {
        id: "main-cart-footer",
        section: document.getElementById("main-cart-footer").dataset.sectionId,
        selector: ".cart-footer__blocks"
      }
    ];
  }
  updateQuantity(line, quantity, name, variantId) {
    this.enableLoading(line);
    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });
    fetch(`${theme.routes.cart_change_url}`, {
      ...theme.fetchConfig(),
      ...{ body }
    }).then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(text);
        });
      }
      return response.text();
    }).then((state) => {
      const parsedState = JSON.parse(state);
      if (parsedState.item_count === 0) {
        this.form.classList.add("hidden");
        this.emptyMessage.classList.remove("hidden");
      } else {
        this.form.classList.remove("hidden");
        this.emptyMessage.classList.add("hidden");
      }
      this.getSectionsToRender().forEach((section) => {
        var _a;
        const elementToReplace = ((_a = document.getElementById(section.id)) == null ? void 0 : _a.querySelector(section.selector)) || document.getElementById(section.id);
        const sectionHTML = this.getSectionInnerHTML(
          parsedState.sections[section.section],
          section.selector
        );
        if (elementToReplace && sectionHTML) {
          elementToReplace.innerHTML = sectionHTML;
        }
      });
      this.updateLiveRegions(line, parsedState.item_count);
      const lineItem = document.getElementById(`CartItem-${line}`);
      if (lineItem && lineItem.querySelector(`[name="${name}"]`))
        lineItem.querySelector(`[name="${name}"]`).focus();
      this.disableLoading();
      publish(PUB_SUB_EVENTS.cartUpdate, {
        source: "cart-items",
        cartData: parsedState,
        variantId
      });
    }).catch((error) => {
      this.querySelectorAll(`.loading-spinner`).forEach((spinner) => {
        spinner.classList.remove("block");
        spinner.classList.add("hidden");
      });
      const lineItem = document.getElementById(`CartItem-${line}`);
      const totalContent = lineItem.querySelector(
        ".cart-item__total-content"
      );
      totalContent.classList.remove("hidden");
      let errorData = {};
      try {
        errorData = JSON.parse(error.message);
      } catch (e) {
        console.error("Error parsing JSON:", e);
      }
      const errorText = lineItem.querySelector(".cart-item__error-text");
      errorText.textContent = errorData.errors || "An error occurred";
      const lineItemQuantity = document.getElementById(`Quantity-${line}`);
      const cartItem = window.theme.cartData.items[line - 1];
      lineItemQuantity.value = cartItem.quantity;
      this.disableLoading();
    });
  }
  getSectionInnerHTML(html, selector = ".shopify-section") {
    const sectionHTML = new DOMParser().parseFromString(html, "text/html").querySelector(selector);
    if (sectionHTML) {
      return sectionHTML.innerHTML;
    } else {
      return false;
    }
  }
  updateLiveRegions(line, itemCount) {
    this.currentItemCount = itemCount;
    this.lineItemStatusElement.setAttribute("aria-hidden", true);
    const cartStatus = document.getElementById("cart-live-region-text");
    cartStatus.setAttribute("aria-hidden", false);
    setTimeout(() => {
      cartStatus.setAttribute("aria-hidden", true);
    }, 1e3);
  }
  enableLoading(line) {
    this.form.classList.add("pointer-events-none");
    this.querySelectorAll(`#CartItem-${line} .loading-spinner`).forEach(
      (spinner) => {
        const totalContent = spinner.parentElement.querySelector(
          ".cart-item__total-content"
        );
        totalContent.classList.add("hidden");
        spinner.classList.remove("hidden");
        spinner.classList.add("block");
      }
    );
    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute("aria-hidden", false);
  }
  disableLoading() {
    this.form.classList.remove("pointer-events-none");
  }
  debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
}
customElements.define("cart-items", CartItems);
