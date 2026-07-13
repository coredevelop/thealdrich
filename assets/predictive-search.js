class PredictiveSearch extends HTMLElement {
  constructor() {
    super();
    const isEnabled = JSON.parse(this.dataset.enabled);
    this.input = this.querySelector('input[type="search"]');
    this.predictiveSearchResults = this.querySelector("#predictive-search");
    this.ModalPredictiveSearch = this.closest("modal-predictive-search");
    this.closeButton = this.querySelector(".search-bar__close");
    this.allSearchInputs = document.querySelectorAll('input[type="search"]');
    this.cachedResults = {};
    this.searchTerm = "";
    this.abortController = new AbortController();
    this.closeButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.close(true);
      if (this.ModalPredictiveSearch) {
        this.ModalPredictiveSearch.closeModal();
      }
    });
    let allSearchForms = [];
    this.allSearchInputs.forEach((input) => allSearchForms.push(input.form));
    this.input.addEventListener("focus", this.onInputFocus.bind(this));
    allSearchForms.forEach(
      (form) => form.addEventListener("reset", this.onFormReset.bind(this))
    );
    this.allSearchInputs.forEach(
      (input) => input.addEventListener("input", this.onInput.bind(this))
    );
    if (!isEnabled) return;
    this.input.addEventListener(
      "input",
      this.debounce((event) => {
        this.onChange(event);
      }, 300).bind(this)
    );
    this.input.form.addEventListener("submit", this.onSubmit.bind(this));
    this.input.addEventListener("focus", this.onFocus.bind(this));
    this.addEventListener("focusout", this.onFocusOut.bind(this));
    this.addEventListener("keyup", this.onKeyup.bind(this));
    this.addEventListener("keydown", this.onKeydown.bind(this));
  }
  onFocus() {
    const currentSearchTerm = this.input.value.trim();
    if (!currentSearchTerm.length) return;
    if (this.searchTerm !== currentSearchTerm) {
      this.onChange();
    } else if (this.getAttribute("results") === "true") {
      this.open();
    } else {
      this.getSearchResults(this.searchTerm);
    }
    const searchLength = currentSearchTerm.length;
    this.input.setSelectionRange(searchLength, searchLength);
  }
  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    });
  }
  onFormReset(event) {
    super.onFormReset(event);
    if (super.shouldResetForm()) {
      this.keepInSync("", this.input);
    }
  }
  onInput(event) {
    const target = event.target;
    this.keepInSync(target.value, target);
  }
  onInputFocus() {
    const isSmallScreen = window.innerWidth < 750;
    if (isSmallScreen) {
      this.scrollIntoView({ behavior: "smooth" });
    }
  }
  keepInSync(value, target) {
    this.allSearchInputs.forEach((input) => {
      if (input !== target) {
        input.value = value;
      }
    });
  }
  onKeyup(event) {
    event.preventDefault();
    switch (event.code) {
      case "ArrowDown":
        this.switchOption("down");
        break;
      case "ArrowUp":
        this.switchOption("up");
        break;
      case "Enter":
        this.selectOption();
        break;
      case "Escape":
        this.close(true, "escape");
        break;
    }
  }
  onKeydown(event) {
    if (event.code === "ArrowDown" || event.code === "ArrowUp") {
      event.preventDefault();
    }
  }
  onChange() {
    var _a;
    const newSearchTerm = this.input.value.trim();
    if (!this.searchTerm || !newSearchTerm.startsWith(this.searchTerm)) {
      (_a = this.querySelector("#predictive-search-results-wrapper")) == null ? void 0 : _a.remove();
    }
    this.searchTerm = newSearchTerm;
    if (!this.searchTerm.length) {
      this.close(true);
      return;
    }
    this.getSearchResults(this.searchTerm);
  }
  onSubmit(event) {
    if (this.input.value.trim().length === 0) {
      event.preventDefault();
      return;
    }
    this.input.form.submit();
    this.selectOption();
  }
  getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(" ", "-").toLowerCase();
    this.setLiveRegionLoadingState();
    if (this.cachedResults[queryKey]) {
      this.renderSearchResults(this.cachedResults[queryKey]);
      return;
    }
    fetch(
      `${theme.routes.predictive_search_url}?q=${encodeURIComponent(
        searchTerm
      )}&section_id=predictive-search`,
      { signal: this.abortController.signal }
    ).then((response) => {
      if (!response.ok) {
        var error = new Error(response.status);
        this.close();
        throw error;
      }
      return response.text();
    }).then((text) => {
      const resultsHtml = new DOMParser().parseFromString(text, "text/html").querySelector("#predictive-search-results-wrapper").innerHTML;
      this.cachedResults[queryKey] = resultsHtml;
      this.renderSearchResults(resultsHtml);
    }).catch((error) => {
      if ((error == null ? void 0 : error.code) === 20) {
        return;
      }
      this.close();
      throw error;
    });
  }
  renderSearchResults(resultsHtml) {
    this.predictiveSearchResults.innerHTML = resultsHtml;
    this.setAttribute("results", true);
    this.setLiveRegionResults();
    this.open();
    this.searchForButton = this.querySelector('button[aria-selected="true"]');
    if (this.searchForButton) {
      this.searchForButton.addEventListener("click", this.handleSearchNavigation.bind(this));
    }
  }
  close(clearSearchTerm = false, type = "") {
    if (this.input.getAttribute("aria-expanded") === "false" && this.ModalPredictiveSearch && type === "escape") {
      this.ModalPredictiveSearch.closeModal();
      return;
    }
    if (clearSearchTerm) {
      this.input.value = "";
      this.removeAttribute("results");
    }
    const selected = this.querySelector('[aria-selected="true"]');
    if (selected) selected.setAttribute("aria-selected", false);
    this.input.setAttribute("aria-activedescendant", "");
    this.removeAttribute("loading");
    this.removeAttribute("open");
    this.input.setAttribute("aria-expanded", false);
    this.isOpen = false;
    this.predictiveSearchResults.style.display = "none";
  }
  open() {
    this.setAttribute("open", true);
    this.input.setAttribute("aria-expanded", true);
    this.isOpen = true;
    this.predictiveSearchResults.style.display = "block";
  }
  switchOption(direction) {
    if (!this.getAttribute("open")) return;
    const focusUp = direction === "up";
    const selectedElement = this.querySelector('[aria-selected="true"]');
    const allFocusElements = Array.from(
      this.querySelectorAll('[role="option"]')
    ).filter((element) => element.offsetParent !== null);
    let activeElementIndex = allFocusElements.indexOf(selectedElement);
    if (!focusUp && selectedElement) {
      activeElementIndex = (activeElementIndex + 1) % allFocusElements.length;
    } else if (focusUp) {
      activeElementIndex = (activeElementIndex - 1 + allFocusElements.length) % allFocusElements.length;
    }
    const activeElement = allFocusElements[activeElementIndex];
    activeElement.setAttribute("aria-selected", true);
    if (selectedElement) selectedElement.setAttribute("aria-selected", false);
    this.input.setAttribute("aria-activedescendant", activeElement.id);
  }
  selectOption() {
    const selectedElement = this.querySelector('[aria-selected="true"]');
    if (selectedElement && selectedElement === this.searchForButton) {
      this.handleSearchNavigation(new Event("click"));
      return;
    }
    const selectedLink = this.querySelector('[aria-selected="true"] a');
    if (selectedLink) {
      selectedLink.click();
    }
  }
  handleSearchNavigation(event) {
    event.preventDefault();
    const searchTerm = this.input.value.trim();
    if (searchTerm) {
      window.location.href = `${theme.routes.search_url}?q=${encodeURIComponent(searchTerm)}`;
    }
  }
  setLiveRegionLoadingState() {
    this.statusElement = this.statusElement || this.querySelector(".predictive-search-status");
    this.loadingText = this.loadingText || this.getAttribute("data-loading-text");
    this.setLiveRegionText(this.loadingText);
    this.setAttribute("loading", true);
  }
  setLiveRegionText(statusText) {
    this.statusElement.setAttribute("aria-hidden", "false");
    this.statusElement.textContent = statusText;
    setTimeout(() => {
      this.statusElement.setAttribute("aria-hidden", "true");
    }, 1e3);
  }
  setLiveRegionResults() {
    this.removeAttribute("loading");
    this.setLiveRegionText(
      this.querySelector("[data-predictive-search-live-region-count-value]").textContent
    );
  }
  debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
}
customElements.define("predictive-search", PredictiveSearch);
