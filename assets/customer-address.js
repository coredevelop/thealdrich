class CustomerAddress extends HTMLElement {
  constructor() {
    super();
    this.toggleButtons = this.querySelectorAll("button[aria-expanded]");
    this.cancelButtons = this.querySelectorAll('button[type="reset"]');
    this.deleteButtons = this.querySelectorAll("button[data-confirm-message]");
    this.setupCountries();
    this.bindEvents();
  }
  setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      new Shopify.CountryProvinceSelector(
        "AddressCountryNew",
        "AddressProvinceNew",
        {
          hideElement: "AddressProvinceContainerNew"
        }
      );
      const editCountrySelects = this.querySelectorAll(
        "[data-address-country-select]"
      );
      editCountrySelects.forEach((select) => {
        const formId = select.dataset.formId;
        new Shopify.CountryProvinceSelector(
          `AddressCountry_${formId}`,
          `AddressProvince_${formId}`,
          {
            hideElement: `AddressProvinceContainer_${formId}`
          }
        );
      });
    }
  }
  bindEvents() {
    this.toggleButtons.forEach((element) => {
      element.addEventListener("click", (event) => {
        event.target.setAttribute(
          "aria-expanded",
          (event.target.getAttribute("aria-expanded") === "false").toString()
        );
      });
    });
    this.cancelButtons.forEach((element) => {
      element.addEventListener("click", (event) => {
        this.querySelector("button[aria-expanded]").setAttribute(
          "aria-expanded",
          (event.target.getAttribute("aria-expanded") === "false").toString()
        );
      });
    });
    this.deleteButtons.forEach((element) => {
      element.addEventListener("click", (event) => {
        if (confirm(event.target.getAttribute("data-confirm-message"))) {
          Shopify.postLink(event.target.dataset.target, {
            parameters: { _method: "delete" }
          });
        }
      });
    });
  }
}
customElements.define("customer-address", CustomerAddress);
