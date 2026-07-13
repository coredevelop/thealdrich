class ProductForm extends HTMLElement {
  constructor() {
    var _a, _b;
    super();
    this.form = this.querySelector("form");
    this.form.querySelector("[name=id]").disabled = false;
    this.form.addEventListener(
      "submit",
      (event) => this.onSubmitHandler(event)
    );
    this.cartType = ((_b = (_a = window.theme) == null ? void 0 : _a.settings) == null ? void 0 : _b.cartType) || "drawer";
    const notifications = document.querySelectorAll("cart-notification");
    this.cartNotification = notifications[notifications.length - 1];
    this.cartDrawer = document.querySelector("cart-drawer");
    this.submitButton = this.querySelector('[type="submit"]');
    this.submitButtonText = this.submitButton.querySelector("span");
    this.hideErrors = this.dataset.hideErrors === "true";
  }
  onSubmitHandler(event) {
    event.preventDefault();
    const loadingClass = "loading";
    if (this.submitButton.classList.contains(loadingClass)) return;
    this.handleErrorMessage();
    if (this.cartType === "preview" && this.cartNotification) {
      this.cartNotification.setActiveElement(document.activeElement);
    } else if (this.cartType === "drawer" && this.cartDrawer) {
      this.cartDrawer.setActiveElement(document.activeElement);
    }
    this.submitButton.setAttribute("aria-disabled", true);
    this.submitButton.classList.add(loadingClass);
    const config = theme.fetchConfig("javascript");
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    delete config.headers["Content-Type"];
    const formData = new FormData(this.form);
    if (this.cartType === "preview" && this.cartNotification) {
      formData.append(
        "sections",
        this.cartNotification.getSectionsToRender().map((section) => section.id)
      );
      formData.append("sections_url", window.location.pathname);
    } else if (this.cartType === "drawer" && this.cartDrawer) {
      formData.append(
        "sections",
        this.cartDrawer.getSectionsToRender().map((section) => section.id)
      );
      formData.append("sections_url", window.location.pathname);
    }
    config.body = formData;
    fetch(`${theme.routes.cart_add_url}`, config).then((response) => response.json()).then((response) => {
      if (response.status) {
        publish(PUB_SUB_EVENTS.cartError, {
          source: "product-form",
          productVariantId: formData.get("id"),
          errors: response.errors || response.description,
          message: response.message
        });
        this.handleErrorMessage(response.description);
        return;
      }
      if (!this.error) {
        publish(PUB_SUB_EVENTS.cartUpdate, {
          source: "product-form",
          productVariantId: formData.get("id"),
          cartData: response
        });
      }
      this.error = false;
      if (this.cartType === "preview" && this.cartNotification) {
        this.cartNotification.renderContents(response);
      } else if (this.cartType === "drawer") {
        if (window.location.pathname !== "/cart") {
          const drawer = this.cartDrawer || document.querySelector("cart-drawer");
          if (drawer) {
            if (response.sections) {
              drawer.renderSections(response.sections);
              const itemsContainer = drawer.querySelector("#cart-drawer-items");
              if (itemsContainer) {
                itemsContainer.dataset.loaded = "true";
              }
            }
            drawer.open(document.activeElement, true);
          }
        }
      } else if (this.cartType === "page") {
        window.location.href = theme.routes.cart_url;
      }
    }).catch((e) => {
      console.error(e);
    }).finally(() => {
      this.submitButton.classList.remove(loadingClass);
      this.submitButton.removeAttribute("aria-disabled");
    });
  }
  handleErrorMessage(errorMessage = false) {
    if (this.hideErrors) return;
    this.errorMessageContainer = this.errorMessageContainer || this.querySelector(".product-form__error-container");
    this.errorMessage = this.errorMessage || this.errorMessageContainer.querySelector(".product-form__error-message");
    this.errorMessageContainer.toggleAttribute("hidden", !errorMessage);
    if (errorMessage) {
      this.errorMessage.textContent = errorMessage;
    }
  }
}
customElements.define("product-form", ProductForm);
