class CollectionSort extends HTMLElement {
  constructor() {
    super();
    this.section = this.closest("div[data-section-id]");
    this.filterSort = this.section.querySelector(
      "collection-drawer .collection-sort__select"
    );
    this.select = this.querySelector("select");
    const isClone = JSON.parse(this.dataset.clone);
    if (isClone && this.filterSort) {
      this.select.addEventListener(
        "change",
        (event) => this.mirrorChange(event)
      );
    } else {
      this.select.addEventListener(
        "change",
        (event) => this.onSortChange(event)
      );
    }
  }
  mirrorChange(event) {
    const value = event.target.value;
    this.filterSort.value = value;
    this.filterSort.dispatchEvent(new Event("change"));
  }
  onSortChange(event) {
    const value = event.target.value;
    const url = new URL(window.location);
    const params = new URLSearchParams(url.search);
    params.set("sort_by", value);
    if (params.get("page") > 1) {
      params.delete("page");
    }
    window.location.assign(`${url.pathname}?${params.toString()}`);
  }
}
customElements.define("collection-sort", CollectionSort);
