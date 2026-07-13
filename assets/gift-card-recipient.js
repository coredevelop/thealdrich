class GiftCardRecipient extends HTMLElement {
  constructor() {
    var _a, _b, _c;
    super();
    this.sectionId = this.dataset.sectionId;
    this.checkbox = this.querySelector('input[type="checkbox"]');
    this.checkbox.disabled = false;
    this.checkbox.setAttribute(
      "aria-controls",
      "recipient-form-" + this.sectionId
    );
    this.checkbox.setAttribute("aria-expanded", "false");
    this.emailInput = this.querySelector(`#Recipient-email-${this.sectionId}`);
    this.nameInput = this.querySelector(`#Recipient-name-${this.sectionId}`);
    this.messageInput = this.querySelector(
      `#Recipient-message-${this.sectionId}`
    );
    this.sendOnInput = this.querySelector(
      `#Recipient-send-on-${this.sectionId}`
    );
    this.timeZoneOffset = this.querySelector(
      `#Recipient-timezone-offset-${this.sectionId}`
    );
    if (this.timeZoneOffset) {
      this.timeZoneOffset.value = (/* @__PURE__ */ new Date()).getTimezoneOffset();
    }
    this.errorMessageWrapper = this.querySelector(".recipient__errors");
    this.errorMessageList = (_a = this.errorMessageWrapper) == null ? void 0 : _a.querySelector("ul");
    this.errorMessage = (_b = this.errorMessageWrapper) == null ? void 0 : _b.querySelector(".message");
    this.defaultErrorMessage = (_c = this.errorMessage) == null ? void 0 : _c.innerText;
    this.liveRegion = this.querySelector(
      `#Recipient-fields-live-region-${this.sectionId}`
    );
    this.currentProductVariantId = this.dataset.productVariantId;
    this.addEventListener("change", this.onChange.bind(this));
    this.onChange();
  }
  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(
      PUB_SUB_EVENTS.cartUpdate,
      (event) => {
        if (event.source === "product-form" && event.productVariantId.toString() === this.currentProductVariantId) {
          this.resetRecipientForm();
        }
      }
    );
    this.variantChangeUnsubscriber = subscribe(
      PUB_SUB_EVENTS.variantChange,
      (event) => {
        if (event.data.sectionId === this.dataset.sectionId) {
          this.currentProductVariantId = event.data.variant.id.toString();
        }
      }
    );
    this.cartUpdateUnsubscriber = subscribe(
      PUB_SUB_EVENTS.cartError,
      (event) => {
        if (event.source === "product-form" && event.productVariantId.toString() === this.currentProductVariantId) {
          this.displayErrorMessage(event.message, event.errors);
        }
      }
    );
  }
  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
    if (this.variantChangeUnsubscriber) {
      this.variantChangeUnsubscriber();
    }
    if (this.cartErrorUnsubscriber) {
      this.cartErrorUnsubscriber();
    }
  }
  onChange() {
    if (this.checkbox.checked) {
      this.enableInputFields();
      this.liveRegion.textContent = window.theme.strings.giftCardRecipientFormExpanded;
      this.checkbox.setAttribute("aria-expanded", "true");
      this.emailInput.focus();
    } else {
      this.clearInputFields();
      this.disableInputFields();
      this.clearErrorMessage();
      this.liveRegion.textContent = window.theme.strings.giftCardRecipientFormCollapsed;
      this.checkbox.setAttribute("aria-expanded", "false");
      this.checkbox.focus();
    }
  }
  inputFields() {
    return [
      this.emailInput,
      this.nameInput,
      this.messageInput,
      this.sendOnInput
    ];
  }
  disableableFields() {
    return [...this.inputFields(), this.timeZoneOffset];
  }
  clearInputFields() {
    this.inputFields().forEach((field) => {
      field.value = "";
    });
  }
  enableInputFields() {
    this.disableableFields().forEach((field) => {
      field.disabled = false;
    });
  }
  disableInputFields() {
    this.disableableFields().forEach((field) => {
      field.disabled = true;
    });
  }
  displayErrorMessage(title, body) {
    this.clearErrorMessage();
    this.errorMessageWrapper.hidden = false;
    if (typeof body === "object") {
      this.errorMessage.innerText = this.defaultErrorMessage;
      return Object.entries(body).forEach(([key, value]) => {
        const errorMessageId = `Recipient-${key}-error-${this.sectionId}`;
        const fieldSelector = `#Recipient-${key}-${this.sectionId}`;
        const message = `${value.join(", ")}`;
        const errorMessageElement = this.querySelector(`#${errorMessageId}`);
        const errorTextElement = errorMessageElement == null ? void 0 : errorMessageElement.querySelector(".error__details");
        if (!errorTextElement) return;
        if (this.errorMessageList) {
          this.errorMessageList.appendChild(
            this.createErrorListItem(fieldSelector, message)
          );
        }
        errorTextElement.innerText = `${message}.`;
        errorMessageElement.classList.remove("hidden");
        const inputElement = this[`${key}Input`];
        if (!inputElement) return;
        inputElement.setAttribute("aria-invalid", true);
        inputElement.setAttribute("aria-describedby", errorMessageId);
      });
    }
    this.errorMessage.innerText = body;
  }
  createErrorListItem(target, message) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.setAttribute("href", target);
    a.innerText = message;
    a.classList.add("underline");
    li.appendChild(a);
    return li;
  }
  clearErrorMessage() {
    this.errorMessageWrapper.hidden = true;
    if (this.errorMessageList) {
      this.errorMessageList.innerHTML = "";
    }
    this.querySelectorAll(".recipient__field .error__container").forEach(
      (field) => {
        field.classList.add("hidden");
        const textField = field.querySelector(".error__details");
        if (textField) textField.innerText = "";
      }
    );
    this.inputFields().forEach((inputElement) => {
      inputElement.setAttribute("aria-invalid", false);
      inputElement.removeAttribute("aria-describedby");
    });
  }
  resetRecipientForm() {
    if (this.checkbox.checked) {
      this.checkbox.checked = false;
      this.clearInputFields();
      this.clearErrorMessage();
    }
  }
}
customElements.define("gift-card-recipient", GiftCardRecipient);
