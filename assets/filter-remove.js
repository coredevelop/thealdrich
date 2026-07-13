class FilterRemove extends HTMLElement {
  constructor() {
    super();
    this.link = this.querySelector(".active-filter");
    if (!this.link) return;
    this.section = this.closest("div[data-section-id]");
    this.collectionDrawer = this.section.querySelector("collection-drawer");
    this.link.addEventListener("click", (event) => {
      event.preventDefault();
      const url = new URL(event.target.href);
      const searchParams = new URLSearchParams(url.search).toString();
      this.collectionDrawer.renderPage(searchParams);
    });
  }
}
customElements.define("filter-remove", FilterRemove);
