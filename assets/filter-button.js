class FilterButton extends HTMLElement {
  constructor() {
    super();
    this.section = this.closest("div[data-section-id]");
    this.button = this.querySelector("button");
    this.collectionDrawer = this.section.querySelector("collection-drawer");
    this.button.addEventListener("click", (event) => {
      this.collectionDrawer.openMenu(event);
    });
  }
}
customElements.define("filter-button", FilterButton);
