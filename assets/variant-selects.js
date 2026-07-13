class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.variantFetchData = [];
    this.section = this.closest("product-info[data-section-id]");
    this.sectionId = this.section.dataset.sectionId;
    this.variants = this.getVariantData();
    this.addEventListener("change", (event) => this.onVariantChange(event));
    this.cacheLength = 5 * 60 * 1e3;
    this.buildOptionsMap();
    this.preProcessHtmlCallbacks = [];
    this.postProcessHtmlCallbacks = [];
  }
  connectedCallback() {
    this.initializeProductSwapUtility();
    this.onVariantChangeUnsubscriber = subscribe(
      PUB_SUB_EVENTS.optionValueSelectionChange,
      this.handleOptionValueChange.bind(this)
    );
    if (this.nodeName === "VARIANT-SELECTS") {
      this.updateOptionsInSelector();
    }
    const mediaSlideshow = document.getElementById(
      `MediaSlideshow-${this.sectionId}`
    );
    if (mediaSlideshow && mediaSlideshow.updateVariantImages) {
      const selectedVariant = this.querySelector("[data-selected-variant]");
      if (selectedVariant) {
        try {
          const variant = JSON.parse(selectedVariant.innerHTML);
          if (variant) {
            mediaSlideshow.updateVariantImages(variant);
          }
        } catch (e) {
          console.warn(
            "Could not parse selected variant for initial image update"
          );
        }
      }
    }
  }
  initializeProductSwapUtility() {
    this.preProcessHtmlCallbacks.push((html) => {
    });
    this.postProcessHtmlCallbacks.push((newNode) => {
      var _a, _b, _c;
      (_b = (_a = window.Shopify) == null ? void 0 : _a.PaymentButton) == null ? void 0 : _b.init();
      (_c = window.ProductModel) == null ? void 0 : _c.loadShopifyXR();
      const mediaSlideshow = newNode.querySelector("media-slideshow");
      if (mediaSlideshow) {
        mediaSlideshow.reinitalize();
      }
    });
  }
  handleOptionValueChange({ data: { event, target, selectedOptionValues } }) {
    if (!this.contains(event.target)) return;
    this.resetProductFormState();
    const productUrl = target.dataset.productUrl || this.pendingRequestUrl || this.dataset.url;
    this.pendingRequestUrl = productUrl;
    const shouldSwapProduct = this.dataset.url !== productUrl;
    const shouldFetchFullPage = this.dataset.updateUrl === "true" && shouldSwapProduct;
    const targetId = target.id;
    const requestUrl = this.buildRequestUrlWithParams(
      productUrl,
      selectedOptionValues,
      shouldFetchFullPage
    );
    this.renderProductInfo({
      requestUrl,
      targetId,
      callback: shouldSwapProduct ? this.handleSwapProduct(productUrl, shouldFetchFullPage) : this.handleUpdateProductInfo(event, productUrl)
    });
  }
  resetProductFormState() {
    this.toggleAddButton(true, "", false);
    this.removeErrorMessage();
  }
  handleSwapProduct(productUrl, updateFullPage) {
    return (html) => {
      const selector = updateFullPage ? "product-info[id^='MainProduct']" : "product-info";
      const variant = this.getSelectedVariant(html.querySelector(selector));
      this.updateURL(productUrl, variant == null ? void 0 : variant.id);
      if (updateFullPage) {
        document.querySelector("head title").innerHTML = html.querySelector("head title").innerHTML;
        const oldMain = document.querySelector("main");
        const newMain = html.querySelector("main");
        this.preserveOpenDetails(oldMain, newMain);
        HTMLUpdateUtility.viewTransition(
          oldMain,
          newMain,
          this.preProcessHtmlCallbacks,
          this.postProcessHtmlCallbacks
        );
      } else {
        const oldProductInfo = this;
        const newProductInfo = html.querySelector("product-info");
        this.preserveOpenDetails(oldProductInfo, newProductInfo);
        HTMLUpdateUtility.viewTransition(
          oldProductInfo,
          newProductInfo,
          this.preProcessHtmlCallbacks,
          this.postProcessHtmlCallbacks
        );
      }
    };
  }
  preserveOpenDetails(oldNode, newNode) {
    const openDetails = oldNode.querySelectorAll("details.product__tab[open]");
    openDetails.forEach((openDetail) => {
      const newDetail = newNode.querySelector(
        `details.product__tab[data-block-id="${openDetail.dataset.blockId}"]`
      );
      if (newDetail) {
        newDetail.setAttribute("open", "");
      }
    });
  }
  getSelectedVariant(productInfoNode) {
    var _a;
    const selectedVariant = (_a = productInfoNode.querySelector(
      ".product__variants [data-selected-variant]"
    )) == null ? void 0 : _a.innerHTML;
    return !!selectedVariant ? JSON.parse(selectedVariant) : null;
  }
  handleUpdateProductInfo(event, productUrl) {
    return (html) => {
      var _a, _b;
      const variant = this.getSelectedVariant(html);
      this.updateOptions();
      this.currentVariant = variant;
      this.updateVariants();
      this.updateOptionsInSelector(html);
      this.updateSwatchDisplay();
      if (!this.currentVariant) {
        this.toggleAddButton(true, "", true);
        this.setUnavailable();
        return;
      }
      this.updateMedia();
      this.updatePickupAvailability();
      this.updateURL(productUrl, (_a = this.currentVariant) == null ? void 0 : _a.id);
      this.updateVariantInput();
      this.updateShareUrl();
      const updateSourceFromDestination = (id, shouldHide = (source) => false) => {
        const productInfo = this.closest("product-info");
        const source = html.getElementById(`${id}-${this.sectionId}`);
        const destination = productInfo.querySelector(
          `#${id}-${this.dataset.section}`
        );
        if (source && destination) {
          destination.innerHTML = source.innerHTML;
          destination.classList.toggle("hidden", shouldHide(source));
        }
      };
      updateSourceFromDestination("price");
      updateSourceFromDestination("sku");
      updateSourceFromDestination("liquid");
      this.renderProductLiquid(html);
      this.toggleAddButton(
        !((_b = this.currentVariant) == null ? void 0 : _b.available),
        theme.strings.soldOut,
        true
      );
    };
  }
  buildRequestUrlWithParams(url, optionValues, shouldFetchFullPage = false) {
    const params = [];
    !shouldFetchFullPage && params.push(`section_id=${this.sectionId}`);
    if (optionValues.length) {
      params.push(`option_values=${optionValues.join(",")}`);
    }
    return `${url}?${params.join("&")}&market=${theme.market}`;
  }
  /**
   * Builds a map of available options based on variant data.
   * Note: This only uses the first 250 variants from getVariantData().
   * For high-variant products (>250), this map will be incomplete.
   * Radio buttons now use HTML response data instead to support unlimited variants.
   */
  buildOptionsMap() {
    this.optionsMap = {};
    if (!this.variants) return;
    this.variants.forEach((variant) => {
      if (variant.available) {
        this.optionsMap["root"] = this.optionsMap["root"] || [];
        this.optionsMap["root"].push(variant.option1);
        const uniqueRootOptionsSet = new Set(this.optionsMap["root"]);
        this.optionsMap["root"] = Array.from(uniqueRootOptionsSet);
        if (variant.options.length > 1) {
          const key = variant.option1;
          this.optionsMap[key] = this.optionsMap[key] || [];
          this.optionsMap[key].push(variant.option2);
          const uniqueOption1Set = new Set(this.optionsMap[key]);
          this.optionsMap[key] = Array.from(uniqueOption1Set);
        }
        if (variant.options.length === 3) {
          const key = `${variant.option1}/${variant.option2}`;
          this.optionsMap[key] = this.optionsMap[key] || [];
          this.optionsMap[key].push(variant.option3);
          const uniqueOption2Set = new Set(this.optionsMap[key]);
          this.optionsMap[key] = Array.from(uniqueOption2Set);
        }
      }
    });
  }
  updateOptionsInSelector(html = null) {
    var _a;
    if (this.nodeName === "VARIANT-SELECTS") {
      if (!html) return;
      const existingSelects = this.querySelectorAll("select");
      const newSelects = html.querySelectorAll("select");
      const focusedSelect = this.querySelector("select:focus");
      existingSelects.forEach((existingSelect, index) => {
        const newSelect = newSelects[index];
        if (existingSelect === focusedSelect) {
          return;
        }
        Array.from(existingSelect.options).forEach((option, optionIndex) => {
          const newOption = newSelect.options[optionIndex];
          if (newOption) {
            option.textContent = newOption.textContent;
          }
        });
      });
      return;
    }
    if (html) {
      const existingFieldsets = this.querySelectorAll("fieldset");
      const newFieldsets = html.querySelectorAll("fieldset");
      existingFieldsets.forEach((existingFieldset, index) => {
        const newFieldset = newFieldsets[index];
        if (!newFieldset) return;
        const existingInputs = existingFieldset.querySelectorAll('input[type="radio"]');
        const newInputs = newFieldset.querySelectorAll('input[type="radio"]');
        existingInputs.forEach((existingInput) => {
          const newInput = Array.from(newInputs).find(
            (input) => input.value === existingInput.value
          );
          if (newInput) {
            if (newInput.classList.contains("product-form__radio--disabled")) {
              existingInput.classList.add("product-form__radio--disabled");
            } else {
              existingInput.classList.remove("product-form__radio--disabled");
            }
          }
        });
      });
      return;
    }
    const options = (_a = this.variants[0]) == null ? void 0 : _a.options;
    if (!options) return;
    for (let i in options) {
      let key;
      if (i == 0) {
        key = "root";
      } else if (i == 1) {
        key = this.querySelectorAll("fieldset")[0].querySelector(
          "input:checked"
        ).value;
      } else {
        key = `${this.querySelectorAll("fieldset")[0].querySelector("input:checked").value}/${this.querySelectorAll("fieldset")[1].querySelector("input:checked").value}`;
      }
      const selector = this.querySelectorAll("fieldset")[i];
      const initialValue = selector.querySelector("input:checked").value;
      const availableOptions = this.optionsMap[key];
      if (!availableOptions) {
        const allVariantSelectors = selector.querySelectorAll("input");
        allVariantSelectors.forEach((variantSelector) => {
          variantSelector.classList.add("product-form__radio--disabled");
        });
        return;
      }
      const variantSelectors = selector.querySelectorAll("input");
      if (key !== "root") {
        variantSelectors.forEach((variantSelector) => {
          if (availableOptions.includes(variantSelector.value)) {
            variantSelector.classList.remove("product-form__radio--disabled");
          } else {
            variantSelector.classList.add("product-form__radio--disabled");
          }
        });
      }
      if (!availableOptions.includes(initialValue) && this.dataset.disableSoldout == "true") {
        const availableInput = selector.querySelector(
          `input[value="${availableOptions[0]}"]`
        );
        availableInput.click();
        break;
      }
    }
  }
  onVariantChange(event) {
    const target = this.getInputForEventTarget(event.target);
    this.updateSelectionMetadata(event);
    publish(PUB_SUB_EVENTS.optionValueSelectionChange, {
      data: {
        event,
        target,
        selectedOptionValues: this.selectedOptionValues
      }
    });
  }
  updateSelectionMetadata({ target }) {
    var _a, _b, _c;
    const { value, tagName } = target;
    if (tagName === "SELECT" && target.selectedOptions.length) {
      (_a = Array.from(target.options).find((option) => option.hasAttribute("selected"))) == null ? void 0 : _a.removeAttribute("selected");
      target.selectedOptions[0].setAttribute("selected", "selected");
      const swatchElement = (_b = target.closest(".group")) == null ? void 0 : _b.querySelector(".select-swatch");
      if (swatchElement) {
        const swatchValue = target.selectedOptions[0].dataset.optionSwatchValue;
        const swatchFocalPoint = target.selectedOptions[0].dataset.optionSwatchFocalPoint || "center";
        if (swatchValue) {
          swatchElement.style.background = swatchValue;
          swatchElement.style.backgroundPosition = swatchFocalPoint;
        } else {
          swatchElement.style.background = "gray";
          swatchElement.style.backgroundPosition = "center";
        }
      }
    } else if (tagName === "INPUT" && target.type === "radio") {
      const swatchNameElement = (_c = target.closest("fieldset")) == null ? void 0 : _c.querySelector(".product-form__swatch-name");
      if (swatchNameElement) {
        swatchNameElement.textContent = value;
      }
    }
  }
  get selectedOptionValues() {
    return Array.from(
      this.querySelectorAll("select option[selected], fieldset input:checked")
    ).map(({ dataset }) => dataset.optionValueId);
  }
  getInputForEventTarget(target) {
    return target.tagName === "SELECT" ? target.selectedOptions[0] : target;
  }
  updateOptions() {
    this.options = Array.from(
      this.querySelectorAll("select"),
      (select) => select.value
    );
  }
  /**
   * Finds the current variant by matching selected options.
   * Note: Only searches within getVariantData() which is limited to 250 variants.
   * For high-variant products, use the variant from HTML response instead.
   * This method is maintained for backwards compatibility with dropdown selectors.
   */
  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }
  updateVariants() {
    const swatches = this.querySelectorAll(".product-form__input.swatches");
    swatches.forEach((swatch) => {
      const swatchName = swatch.querySelector(".product-form__swatch-name");
      const radios = swatch.querySelectorAll('input[type="radio"]');
      const value = Array.from(radios).find((radio) => radio.checked).value;
      swatchName.textContent = value;
    });
  }
  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(
      `product-form-${this.dataset.section}`
    );
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtons = productForm.querySelector(".product-form__buttons");
    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (!addButton) return;
    if (disable) {
      addButton.setAttribute("disabled", "disabled");
      if (text) addButtonText.textContent = text;
      if (modifyClass) {
        addButtons.dataset.enabled = false;
      }
    } else {
      addButton.removeAttribute("disabled");
      addButtonText.textContent = theme.strings.addToCart;
      addButtons.dataset.enabled = true;
    }
    if (!modifyClass) return;
  }
  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector("pickup-availability");
    if (!pickUpAvailability) return;
    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute("available");
      pickUpAvailability.innerHTML = "";
    }
  }
  removeErrorMessage() {
    if (!this.section) return;
    const productForm = this.section.querySelector("product-form");
    if (productForm) productForm.handleErrorMessage();
  }
  setUnavailable() {
    const button = document.getElementById(
      `product-form-${this.dataset.section}`
    );
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    const liquid = document.getElementById(`liquid-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.textContent = theme.strings.unavailable;
    if (price) price.classList.add("hidden");
    if (liquid) liquid.classList.add("hidden");
  }
  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;
    const mediaSlideshow = document.getElementById(
      `MediaSlideshow-${this.dataset.section}`
    );
    if (mediaSlideshow && mediaSlideshow.updateVariantImages) {
      mediaSlideshow.updateVariantImages(this.currentVariant);
    }
    mediaSlideshow.setActiveMedia(
      `${this.dataset.section}-${this.currentVariant.featured_media.id}`
    );
  }
  updateURL(url, variantId) {
    var _a;
    (_a = this.querySelector("share-button")) == null ? void 0 : _a.updateUrl(
      `${window.shopUrl}${url}${variantId ? `?variant=${variantId}` : ""}`
    );
    if (this.dataset.updateUrl === "false") return;
    window.history.replaceState(
      {},
      "",
      `${url}${variantId ? `?variant=${variantId}` : ""}`
    );
  }
  updateVariantInput() {
    const productForms = document.querySelectorAll(
      `#product-form-${this.dataset.section}, #product-form-installment`
    );
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }
  async renderProductInfo({ requestUrl, targetId, callback }) {
    var _a, _b;
    (_a = this.abortController) == null ? void 0 : _a.abort();
    this.abortController = new AbortController();
    try {
      const responseText = await this.fetchWithCache(requestUrl);
      this.pendingRequestUrl = null;
      const html = new DOMParser().parseFromString(responseText, "text/html");
      callback(html);
      (_b = document.querySelector(`#${targetId}`)) == null ? void 0 : _b.focus();
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("Request aborted");
      } else {
        console.error("Error fetching product info:", error);
      }
    }
  }
  async fetchWithCache(requestUrl, cacheTime = this.cacheLength) {
    const cacheName = "product-info-cache";
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(requestUrl);
    if (cachedResponse) {
      const cachedData = await cachedResponse.json();
      if (Date.now() - cachedData.timestamp < cacheTime) {
        return cachedData.data;
      }
    }
    const response = await fetch(requestUrl);
    const data = await response.text();
    const cacheData = {
      timestamp: Date.now(),
      data
    };
    await cache.put(requestUrl, new Response(JSON.stringify(cacheData)));
    return data;
  }
  renderProductInfoFromCache(filterDataUrl) {
    const html = this.variantFetchData.find(filterDataUrl).html;
    this.renderProductPrice(html);
    this.renderProductButtons(html);
    this.renderProductLiquid(html);
    publish(PUB_SUB_EVENTS.variantChange, {
      data: {
        sectionId: this.sectionId,
        html,
        variant: this.currentVariant
      }
    });
  }
  renderProductInfoFromFetch(url) {
    fetch(url).then((response) => response.text()).then((responseText) => {
      const html = responseText;
      this.variantFetchData = [...this.variantFetchData, { html, url }];
      this.renderProductPrice(html);
      this.renderProductButtons(html);
      this.renderProductLiquid(html);
      publish(PUB_SUB_EVENTS.variantChange, {
        data: {
          sectionId: this.sectionId,
          html,
          variant: this.currentVariant
        }
      });
    });
  }
  renderProductPrice(html) {
    const id = `price-${this.dataset.section}`;
    const parsedHTML = new DOMParser().parseFromString(html, "text/html");
    const destination = document.getElementById(id);
    const source = parsedHTML.getElementById(id);
    if (source && destination) destination.innerHTML = source.innerHTML;
  }
  renderProductLiquid(html) {
    const sourceLiquidBlocks = document.querySelectorAll(
      `.product__liquid[data-section="${this.dataset.section}"]`
    );
    if (sourceLiquidBlocks.length === 0) {
      return;
    }
    const parsedHTML = new DOMParser().parseFromString(html, "text/html");
    const liquidBlocks = parsedHTML.querySelectorAll(".product__liquid");
    liquidBlocks.forEach((liquidBlock) => {
      const blockId = liquidBlock.dataset.blockId;
      const sourceBlock = document.querySelector(
        `.product__liquid[data-section="${this.dataset.section}"][data-block-id="${blockId}"]`
      );
      if (sourceBlock) {
        sourceBlock.innerHTML = liquidBlock.innerHTML;
      }
    });
  }
  renderProductButtons(html) {
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (price) price.classList.remove("hidden");
    this.toggleAddButton(!this.currentVariant.available, theme.strings.soldOut);
  }
  updateShareUrl() {
    const shareUrl = `${theme.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`;
    const shareText = encodeURI(this.dataset.sectionText);
    const facebookLink = this.section.querySelector(
      ".social-share__link--facebook"
    );
    const twitterLink = this.section.querySelector(
      ".social-share__link--twitter"
    );
    const pinterestLink = this.section.querySelector(
      ".social-share__link--pinterest"
    );
    if (facebookLink) {
      facebookLink.setAttribute(
        "href",
        `https://www.facebook.com/sharer.php?u=${shareUrl}`
      );
    }
    if (twitterLink) {
      twitterLink.setAttribute(
        "href",
        `https://twitter.com/share?url=${shareUrl}&text=${shareText}`
      );
    }
    if (pinterestLink) {
      pinterestLink.setAttribute(
        "href",
        `https://pinterest.com/pin/create/bookmarklet/?url=${shareUrl}&description=${shareText}`
      );
    }
  }
  /**
   * Returns variant data from the embedded JSON script tag.
   * Note: Shopify limits this to a maximum of 250 variants.
   * For products with more variants, this will be a truncated list.
   */
  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
  updateSwatchDisplay() {
    const selects = this.querySelectorAll("select");
    selects.forEach((select) => {
      const selectedOption = select.options[select.selectedIndex];
      const swatchValue = selectedOption.dataset.optionSwatchValue || "gray";
      const swatchFocalPoint = selectedOption.dataset.optionSwatchFocalPoint || "center";
      const selectWrapper = select.closest(".group");
      const swatchElement = selectWrapper == null ? void 0 : selectWrapper.querySelector(".select-swatch");
      if (swatchElement) {
        try {
          swatchElement.style.background = swatchValue;
          swatchElement.style.backgroundPosition = swatchFocalPoint;
        } catch (error) {
          console.warn("Error updating swatch display:", error);
          swatchElement.style.background = "gray";
          swatchElement.style.backgroundPosition = "center";
        }
      }
    });
  }
  // Add methods to manage callbacks
  addPreProcessCallback(callback) {
    this.preProcessHtmlCallbacks.push(callback);
  }
  addPostProcessCallback(callback) {
    this.postProcessHtmlCallbacks.push(callback);
  }
}
customElements.define("variant-selects", VariantSelects);
class HTMLUpdateUtility {
  /**
   * Used to swap an HTML node with a new node.
   * The new node is inserted as a previous sibling to the old node, the old node is hidden, and then the old node is removed.
   *
   * The function currently uses a double buffer approach, but this should be replaced by a view transition once it is more widely supported https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
   */
  static viewTransition(oldNode, newContent, preProcessCallbacks = [], postProcessCallbacks = []) {
    preProcessCallbacks == null ? void 0 : preProcessCallbacks.forEach((callback) => callback(newContent));
    const newNodeWrapper = document.createElement("div");
    HTMLUpdateUtility.setInnerHTML(newNodeWrapper, newContent.outerHTML);
    const newNode = newNodeWrapper.firstChild;
    const uniqueKey = Date.now();
    oldNode.querySelectorAll("[id], [form]").forEach((element) => {
      element.id && (element.id = `${element.id}-${uniqueKey}`);
      element.form && element.setAttribute(
        "form",
        `${element.form.getAttribute("id")}-${uniqueKey}`
      );
    });
    oldNode.parentNode.insertBefore(newNode, oldNode);
    oldNode.style.display = "none";
    postProcessCallbacks == null ? void 0 : postProcessCallbacks.forEach((callback) => callback(newNode));
    setTimeout(() => oldNode.remove(), 500);
  }
  // Sets inner HTML and reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
  static setInnerHTML(element, html) {
    element.innerHTML = html;
    element.querySelectorAll("script").forEach((oldScriptTag) => {
      const newScriptTag = document.createElement("script");
      Array.from(oldScriptTag.attributes).forEach((attribute) => {
        newScriptTag.setAttribute(attribute.name, attribute.value);
      });
      newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
      oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
    });
  }
}
export {
  VariantSelects
};
