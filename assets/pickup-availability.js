class PickupAvailability extends HTMLElement {
  constructor() {
    super();
    if (!this.hasAttribute("available")) return;
    this.errorHtml = this.querySelector("template").content.cloneNode(true);
    this.onClickRefreshList = this.onClickRefreshList.bind(this);
    this.fetchAvailability(Number(this.dataset.variantId));
  }
  onClickRefreshList(evt) {
    this.fetchAvailability(this.dataset.variantId);
  }
  fetchAvailability(variantId) {
    let rootUrl = this.dataset.rootUrl;
    if (!rootUrl.endsWith("/")) {
      rootUrl = rootUrl + "/";
    }
    const variantSectionUrl = `${rootUrl}variants/${variantId}/?section_id=pickup-availability`;
    fetch(variantSectionUrl).then((response) => response.text()).then((text) => {
      const sectionInnerHTML = new DOMParser().parseFromString(text, "text/html").querySelector(".shopify-section");
      this.renderPreview(sectionInnerHTML);
    }).catch((e) => {
      const button = this.querySelector("button");
      if (button)
        button.removeEventListener("click", this.onClickRefreshList);
      this.renderError();
    });
  }
  renderError() {
    this.innerHTML = "";
    this.appendChild(this.errorHtml);
    if (!this.querySelector("button")) return;
    this.querySelector("button").addEventListener("click", (event) => {
      this.fetchAvailability(this.dataset.variantId);
    });
  }
  renderPreview(sectionInnerHTML) {
    const drawer = document.querySelector("pickup-availability-drawer");
    if (drawer) drawer.remove();
    if (!sectionInnerHTML.querySelector("pickup-availability-preview")) {
      this.innerHTML = "";
      this.removeAttribute("available");
      return;
    }
    this.innerHTML = sectionInnerHTML.querySelector(
      "pickup-availability-preview"
    ).outerHTML;
    this.setAttribute("available", "");
    document.body.appendChild(
      sectionInnerHTML.querySelector("pickup-availability-drawer")
    );
    const button = this.querySelector("button");
    if (button)
      button.addEventListener("click", (evt) => {
        document.querySelector("pickup-availability-drawer").show(evt.target);
      });
  }
}
customElements.define("pickup-availability", PickupAvailability);
