import { c as createFocusTrap } from "vendors/focus-trap.esm";
class CollectionDrawer extends HTMLElement {
  constructor() {
    super();
    this.filterData = [];
    this.section = this.closest("div[data-section-id]");
    this.productCount = this.section.querySelector("#ProductCount");
    this.menuButton = this.section.querySelector("filter-button button");
    this.modalBackground = this.querySelector(".modal__background");
    this.modalClose = this.querySelector(".modal__close");
    this.details = this.querySelectorAll("details.filter-group");
    this.form = this.querySelector("form.filter__form");
    this.focusTrap = createFocusTrap(this, {
      initialFocus: false
    });
    this.searchParamsInitial = window.location.search.slice(1);
    this.searchParamsPrev = window.location.search.slice(1);
    this.lastFocusedElement = null;
    this.bindEvents();
    this.bindFilterEvents();
  }
  bindFilterEvents() {
    this.filterInputs = this.querySelectorAll(
      'details.filter-group input[type="checkbox"], select.collection-sort__select, details.filter-group input[type="number"]'
    );
    this.filterTypingInputs = this.querySelectorAll(
      'details.filter-group input[type="number"], details.filter-group input[type="text"]'
    );
    this.filterInputs.forEach((input) => {
      if (input.dataset.eventBind) return;
      input.addEventListener("change", (event) => this.filterCollection(event));
      input.setAttribute("data-event-bind", true);
    });
    this.keyUpTimeout = null;
    this.keyUpDelay = 700;
    this.filterTypingInputs.forEach((input) => {
      input.addEventListener("keyup", (event) => this.onFilterKeyUp(event));
      input.addEventListener("focus", () => this.onInputFocus(input));
      input.addEventListener("blur", () => this.onInputBlur(input));
    });
    this.filterInputs.forEach((input) => {
      input.addEventListener("focus", () => {
        this.lastFocusedElement = input;
      });
    });
  }
  onInputFocus(input) {
    this.lastFocusedElement = input;
    input.dataset.originalValue = input.value;
  }
  onInputBlur(input) {
    if (input.value !== input.dataset.originalValue) {
      this.filterCollection();
    }
    delete input.dataset.originalValue;
  }
  onFilterKeyUp(event) {
    if (event.key === "Tab" || event.key === "Shift") return;
    if (this.keyUpTimeout) {
      window.clearTimeout(this.keyUpTimeout);
    }
    this.keyUpTimeout = setTimeout(() => {
      this.filterCollection();
    }, this.keyUpDelay);
  }
  bindEvents() {
    this.modalBackground.addEventListener(
      "click",
      (event) => this.closeMenu(event)
    );
    this.modalClose.addEventListener("click", (event) => this.closeMenu(event));
    this.addEventListener("keyup", (event) => this.menuKeyUp(event));
    if (this.form) {
      this.form.addEventListener("keypress", (event) => {
        if (event.code.toUpperCase() === "ENTER" && event.target.tagName !== "SUMMARY") {
          event.preventDefault();
        }
      });
    }
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : this.searchParamsInitial;
      if (searchParams === this.searchParamsPrev) return;
      this.renderPage(searchParams, null, false);
    };
    window.addEventListener("popstate", onHistoryChange);
  }
  openMenu(event) {
    event.preventDefault();
    this.details.forEach((details) => {
      const active = JSON.parse(details.dataset.activeFilter);
      if (!active) {
        details.removeAttribute("open");
      }
    });
    this.menuButton.setAttribute("aria-expanded", true);
    this.setAttribute("open", true);
    document.body.classList.add("has-modal");
    this.modalClose.focus();
    this.focusTrap.activate();
  }
  menuKeyUp(event) {
    if (event.code.toUpperCase() !== "ESCAPE") return;
    this.closeMenu(event);
  }
  closeMenu(event) {
    event.preventDefault();
    this.details.forEach((details) => {
      details.setAttribute("open", true);
    });
    this.menuButton.setAttribute("aria-expanded", false);
    this.removeAttribute("open");
    document.body.classList.remove("has-modal");
    this.focusTrap.deactivate();
  }
  filterCollection(event) {
    const formData = new FormData(this.querySelector("form"));
    const searchParams = new URLSearchParams(formData).toString();
    if (event && event.target.classList.contains("collection-sort__select")) {
      const collectionSortClone = this.section.querySelector(
        'collection-sort[data-clone="true"] select'
      );
      if (collectionSortClone) {
        collectionSortClone.value = event.target.value;
      }
    }
    this.renderPage(searchParams);
  }
  renderPage(searchParams, event, updateURLHash = true) {
    this.searchParamsPrev = searchParams;
    this.section.classList.add("loading");
    if (this.productCount) {
      this.productCount.classList.add("loading");
    }
    const url = `${window.location.pathname}?section_id=${this.section.dataset.sectionId}&${searchParams}`;
    const filterDataUrl = (element) => element.url === url;
    this.filterData.some(filterDataUrl) ? this.renderSectionFromCache(filterDataUrl, event) : this.renderSectionFromFetch(url, event);
    if (updateURLHash) this.updateURLHash(searchParams);
  }
  updateURLHash(searchParams) {
    history.pushState(
      { searchParams },
      "",
      `${window.location.pathname}${searchParams && "?".concat(searchParams)}`
    );
  }
  renderSectionFromCache(filterDataUrl, event) {
    const html = this.filterData.find(filterDataUrl).html;
    this.renderFilters(html, event);
    this.renderProductGridContainer(html);
    this.renderProductCount(html);
    this.renderCollectionSort();
    this.restoreFocus();
  }
  renderSectionFromFetch(url, event) {
    fetch(url).then((response) => response.text()).then((responseText) => {
      const html = responseText;
      this.filterData = [...this.filterData, { html, url }];
      this.renderFilters(html, event);
      this.renderProductGridContainer(html);
      this.renderProductCount(html);
      this.renderCollectionSort();
      this.restoreFocus();
    });
  }
  renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, "text/html");
    const filtersContainer = this.section.querySelector(".filters__container");
    const filterDetails = filtersContainer.querySelectorAll(
      "details.filter-group"
    );
    const detailsStates = [];
    filterDetails.forEach((details) => {
      const filterList = details.querySelector(".filter-group-display__list");
      const scrollPosition = filterList ? filterList.scrollTop : 0;
      detailsStates.push({
        open: details.open,
        scroll: scrollPosition
      });
    });
    filtersContainer.innerHTML = parsedHTML.querySelector(
      ".filters__container"
    ).innerHTML;
    const newFilterDetails = filtersContainer.querySelectorAll(
      "details.filter-group"
    );
    newFilterDetails.forEach((details, i) => {
      const state = detailsStates[i];
      if (!state.open) {
        details.removeAttribute("open");
      }
      const filterList = details.querySelector(".filter-group-display__list");
      if (filterList) {
        filterList.scrollTop = state.scroll;
      }
    });
    this.bindFilterEvents();
    const activeFilters = this.section.querySelector(
      ".collection__active-filters"
    );
    activeFilters.innerHTML = parsedHTML.querySelector(
      ".collection__active-filters"
    ).innerHTML;
  }
  renderProductGridContainer(html) {
    document.getElementById("ProductGridContainer").innerHTML = new DOMParser().parseFromString(html, "text/html").getElementById("ProductGridContainer").innerHTML;
  }
  renderProductCount(html) {
    const count = new DOMParser().parseFromString(html, "text/html").getElementById("ProductCount").innerHTML;
    this.section.classList.remove("loading");
    if (this.productCount) {
      this.productCount.classList.remove("loading");
      this.productCount.innerHTML = count;
    }
  }
  renderCollectionSort() {
    const url = new URL(window.location);
    const params = new URLSearchParams(url.search);
    const value = params.get("sort_by");
    const selects = this.section.querySelectorAll(".collection-sort__select");
    selects.forEach((select) => {
      select.value = value;
    });
  }
  restoreFocus() {
    if (this.lastFocusedElement) {
      const newElement = this.querySelector(`#${this.lastFocusedElement.id}`);
      if (newElement) {
        newElement.focus();
      } else {
        const similarElements = this.querySelectorAll(
          `[name="${this.lastFocusedElement.name}"]`
        );
        if (similarElements.length > 0) {
          similarElements[0].focus();
        }
      }
    }
  }
}
customElements.define("collection-drawer", CollectionDrawer);
