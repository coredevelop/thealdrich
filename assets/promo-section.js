import { a as api } from "vendors/js.cookie";
var libConfig = {
  tag: "data-slide-toggle",
  values: {
    hidden: "hidden",
    visible: "shown"
  }
};
var validators = {
  isHidden: function(element) {
    return element.getAttribute(libConfig.tag) === libConfig.values.hidden;
  },
  isVisible: function(element) {
    return element.getAttribute(libConfig.tag) === libConfig.values.visible;
  },
  hasTagDefined: function(element) {
    return !!element.getAttribute(libConfig.tag);
  }
};
var show = function(element, _a) {
  var _b = _a.miliseconds, miliseconds = _b === void 0 ? 1e3 : _b, onAnimationEnd = _a.onAnimationEnd, onAnimationStart = _a.onAnimationStart, _c = _a.elementDisplayStyle, elementDisplayStyle = _c === void 0 ? "block" : _c;
  if (validators.isVisible(element)) {
    return;
  }
  element.setAttribute(libConfig.tag, libConfig.values.visible);
  onAnimationStart === null || onAnimationStart === void 0 ? void 0 : onAnimationStart(element);
  element.style.height = "auto";
  element.style.overflow = "hidden";
  element.style.display = elementDisplayStyle;
  var animationRef = element.animate([{ height: "0px" }, { height: "".concat(element.offsetHeight, "px") }], { duration: miliseconds });
  animationRef.addEventListener("finish", function() {
    element.style.height = "";
    element.style.overflow = "";
    onAnimationEnd === null || onAnimationEnd === void 0 ? void 0 : onAnimationEnd(element);
  });
};
var hide = function(element, _a) {
  var _b = _a.miliseconds, miliseconds = _b === void 0 ? 1e3 : _b, onAnimationStart = _a.onAnimationStart, onAnimationEnd = _a.onAnimationEnd;
  if (validators.isHidden(element)) {
    return;
  }
  element.setAttribute(libConfig.tag, libConfig.values.hidden);
  onAnimationStart === null || onAnimationStart === void 0 ? void 0 : onAnimationStart(element);
  element.style.overflow = "hidden";
  var animationRef = element.animate([{ height: "".concat(element.offsetHeight, "px") }, { height: "0px" }], { duration: miliseconds });
  animationRef.addEventListener("finish", function() {
    element.style.overflow = "";
    element.style.display = "none";
    onAnimationEnd === null || onAnimationEnd === void 0 ? void 0 : onAnimationEnd(element);
  });
};
var __assign = function() {
  __assign = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
        t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
var toggle = function(element, options) {
  if (validators.hasTagDefined(element)) {
    if (validators.isVisible(element)) {
      var onAnimationEnd_1 = options.onAnimationEnd, onClose_1 = options.onClose;
      hide(element, __assign(__assign({}, options), { onAnimationEnd: function(elementRef) {
        onClose_1 === null || onClose_1 === void 0 ? void 0 : onClose_1(elementRef);
        onAnimationEnd_1 === null || onAnimationEnd_1 === void 0 ? void 0 : onAnimationEnd_1(elementRef);
      } }));
    } else {
      var onAnimationEnd_2 = options.onAnimationEnd, onOpen_1 = options.onOpen;
      show(element, __assign(__assign({}, options), { onAnimationEnd: function(elementRef) {
        onOpen_1 === null || onOpen_1 === void 0 ? void 0 : onOpen_1(elementRef);
        onAnimationEnd_2 === null || onAnimationEnd_2 === void 0 ? void 0 : onAnimationEnd_2(elementRef);
      } }));
    }
  } else {
    if (element.offsetHeight === 0) {
      var onAnimationEnd_3 = options.onAnimationEnd, onOpen_2 = options.onOpen;
      show(element, __assign(__assign({}, options), { onAnimationEnd: function(elementRef) {
        onOpen_2 === null || onOpen_2 === void 0 ? void 0 : onOpen_2(elementRef);
        onAnimationEnd_3 === null || onAnimationEnd_3 === void 0 ? void 0 : onAnimationEnd_3(elementRef);
      } }));
    } else {
      var onAnimationEnd_4 = options.onAnimationEnd, onClose_2 = options.onClose;
      hide(element, __assign(__assign({}, options), { onAnimationEnd: function(elementRef) {
        onClose_2 === null || onClose_2 === void 0 ? void 0 : onClose_2(elementRef);
        onAnimationEnd_4 === null || onAnimationEnd_4 === void 0 ? void 0 : onAnimationEnd_4(elementRef);
      } }));
    }
  }
};
class PromoSection extends HTMLElement {
  constructor() {
    super();
    this.sticky = JSON.parse(this.dataset.sticky);
    this.announcementBars = this.querySelectorAll(
      '[data-block-type="announcement-bar"]'
    );
    if (this.announcementBars.length > 0) {
      this.initAnnoucementBars();
    }
    if (this.sticky) {
      this.setResizeObserver();
      this.setTopPosition();
    }
    this.bindEvents();
  }
  setTopPosition() {
    const headerGroups = document.querySelectorAll(
      ".shopify-section-group-header-group .block"
    );
    const headerGroupIndex = Array.prototype.indexOf.call(headerGroups, this);
    const headerGroupsBefore = Array.prototype.slice.call(
      headerGroups,
      0,
      headerGroupIndex
    );
    let top = 0;
    let calc = [];
    headerGroupsBefore.forEach((headerGroup) => {
      const cssVar = headerGroup.dataset.heightCssVar;
      if (cssVar) {
        calc.push(`var(${cssVar})`);
      }
    });
    if (calc.length) {
      top = `calc(${calc.join(" + ")})`;
    }
    this.parentElement.style.top = top;
  }
  setResizeObserver() {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const height = entry.contentRect.height;
        document.documentElement.style.setProperty(
          "--promo-section-height",
          `${height}px`
        );
      }
    });
    resizeObserver.observe(this);
  }
  initAnnoucementBars() {
    this.announcementBars.forEach((bar) => {
      const hideDelay = JSON.parse(bar.dataset.hideDelay);
      if (!hideDelay || Shopify.designMode) return;
      setTimeout(() => {
        hide(bar, {
          miliseconds: 300
        });
      }, hideDelay);
    });
  }
  bindEvents() {
    const signupBars = this.querySelectorAll('[data-block-type="signup-bar"]');
    if (signupBars.length > 0) {
      signupBars.forEach((bar) => {
        const blockType = bar.dataset.blockType;
        const blockId = bar.dataset.blockId;
        const button = bar.querySelector(".signup-bar__close");
        const form = bar.querySelector("form");
        const showFor = bar.dataset.showFor;
        const showDelay = bar.dataset.delay;
        if (Shopify.designMode) {
          return;
        }
        if (api.get(`${blockType}-${blockId}`) === void 0) {
          setTimeout(() => {
            if (showFor === "desktop" && window.innerWidth < theme.mobileBreakpoint) {
              return;
            }
            if (showFor === "mobile" && window.innerWidth >= theme.mobileBreakpoint) {
              return;
            }
            toggle(bar, {
              miliseconds: 300,
              transitionFunction: "ease-out"
            });
          }, showDelay);
        }
        button.addEventListener("click", (event) => {
          toggle(bar, {
            miliseconds: 300,
            transitionFunction: "ease-out"
          });
          const expireDays = 60;
          api.set(`${blockType}-${blockId}`, "close", {
            expires: expireDays
          });
          event.preventDefault();
        });
        if (this.form) {
          form.addEventListener("submit", (event) => {
            toggle(bar, {
              miliseconds: 300,
              transitionFunction: "ease-out"
            });
            const expireDays = 365;
            api.set(`${blockType}-${blockId}`, "submit", {
              expires: expireDays
            });
          });
        }
      });
    }
    if (Shopify.designMode) {
      document.addEventListener("shopify:block:select", (event) => {
        const blockId = event.detail.blockId;
        const selectedBlock = this.querySelector(
          `[data-block-id="${blockId}"]`
        );
        if (!selectedBlock) return;
        if (selectedBlock.dataset.blockType === "signup-bar") {
          show(selectedBlock, {
            miliseconds: 300
          });
        }
        if (selectedBlock.dataset.blockType === "popup") {
          selectedBlock.showModal();
        }
      });
      document.addEventListener("shopify:block:deselect", (event) => {
        const blockId = event.detail.blockId;
        const selectedBlock = this.querySelector(
          `[data-block-id="${blockId}"]`
        );
        if (!selectedBlock) return;
        if (selectedBlock.dataset.blockType === "signup-bar") {
          hide(selectedBlock, {
            miliseconds: 300
          });
        }
        if (selectedBlock.dataset.blockType === "popup") {
          selectedBlock.hideModal();
        }
      });
    }
  }
}
customElements.define("promo-section", PromoSection);
