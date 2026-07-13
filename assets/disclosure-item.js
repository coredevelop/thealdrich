class DisclosureItem extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector("button");
    this.panel = this.querySelector("ul.disclosure__list");
    this.button.addEventListener("click", (event) => this.openPanel(event));
    this.addEventListener("focusout", (event) => this.panelFocusCheck(event));
    this.addEventListener("keyup", (event) => this.panelKeyUp(event));
  }
  openPanel(event) {
    event.preventDefault();
    this.button.focus();
    this.panel.toggleAttribute("hidden");
    this.button.setAttribute(
      "aria-expanded",
      (this.button.getAttribute("aria-expanded") === "false").toString()
    );
  }
  panelFocusCheck(event) {
    if (event.relatedTarget === null || !this.contains(event.relatedTarget)) {
      this.hidePanel();
    }
  }
  panelKeyUp(event) {
    if (event.code.toUpperCase() !== "ESCAPE") return;
    this.hidePanel();
    this.button.focus();
  }
  hidePanel() {
    this.button.setAttribute("aria-expanded", "false");
    this.panel.setAttribute("hidden", true);
  }
}
customElements.define("disclosure-item", DisclosureItem);
export {
  DisclosureItem as default
};
