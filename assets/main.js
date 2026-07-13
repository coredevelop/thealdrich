import { _ as __vitePreload } from "main/modulepreload-polyfill";
function media({ query }) {
  const mediaQuery = window.matchMedia(query);
  return new Promise(function(resolve) {
    if (mediaQuery.matches) {
      resolve(true);
    } else {
      mediaQuery.addEventListener("change", resolve, { once: true });
    }
  });
}
function visible({ element }) {
  return new Promise(function(resolve) {
    const observer = new window.IntersectionObserver(async function(entries) {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          observer.disconnect();
          resolve(true);
          break;
        }
      }
    });
    observer.observe(element);
  });
}
function idle() {
  return new Promise(function(resolve) {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(resolve);
    } else {
      setTimeout(resolve, 200);
    }
  });
}
const islands = /* @__PURE__ */ Object.assign({ "/frontend/islands/cart-agreement.js": () => __vitePreload(() => import("components/cart-agreement"), true ? [] : void 0, import.meta.url), "/frontend/islands/cart-discount.js": () => __vitePreload(() => import("components/cart-discount"), true ? [] : void 0, import.meta.url), "/frontend/islands/cart-drawer-items.js": () => __vitePreload(() => import("components/cart-drawer-items"), true ? [] : void 0, import.meta.url), "/frontend/islands/cart-drawer.js": () => __vitePreload(() => import("components/cart-drawer"), true ? [] : void 0, import.meta.url), "/frontend/islands/cart-items.js": () => __vitePreload(() => import("components/cart-items"), true ? [] : void 0, import.meta.url), "/frontend/islands/cart-note.js": () => __vitePreload(() => import("components/cart-note"), true ? [] : void 0, import.meta.url), "/frontend/islands/cart-notification.js": () => __vitePreload(() => import("components/cart-notification"), true ? [] : void 0, import.meta.url), "/frontend/islands/cart-remove-button.js": () => __vitePreload(() => import("components/cart-remove-button"), true ? [] : void 0, import.meta.url), "/frontend/islands/collection-drawer.js": () => __vitePreload(() => import("components/collection-drawer"), true ? [] : void 0, import.meta.url), "/frontend/islands/collection-slider-component.js": () => __vitePreload(() => import("components/collection-slider-component"), true ? [] : void 0, import.meta.url), "/frontend/islands/collection-sort.js": () => __vitePreload(() => import("components/collection-sort"), true ? [] : void 0, import.meta.url), "/frontend/islands/disclosure-form.js": () => __vitePreload(() => import("components/disclosure-form"), true ? [] : void 0, import.meta.url), "/frontend/islands/disclosure-item.js": () => __vitePreload(() => import("components/disclosure-item"), true ? [] : void 0, import.meta.url), "/frontend/islands/disclosure-menu.js": () => __vitePreload(() => import("components/disclosure-menu"), true ? [] : void 0, import.meta.url), "/frontend/islands/filter-button.js": () => __vitePreload(() => import("components/filter-button"), true ? [] : void 0, import.meta.url), "/frontend/islands/filter-remove.js": () => __vitePreload(() => import("components/filter-remove"), true ? [] : void 0, import.meta.url), "/frontend/islands/gift-card-recipient.js": () => __vitePreload(() => import("components/gift-card-recipient"), true ? [] : void 0, import.meta.url), "/frontend/islands/header-section.js": () => __vitePreload(() => import("components/header-section"), true ? [] : void 0, import.meta.url), "/frontend/islands/header-top-section.js": () => __vitePreload(() => import("components/header-top-section"), true ? [] : void 0, import.meta.url), "/frontend/islands/looks-item.js": () => __vitePreload(() => import("components/looks-item"), true ? [] : void 0, import.meta.url), "/frontend/islands/map-object.js": () => __vitePreload(() => import("components/map-object"), true ? [] : void 0, import.meta.url), "/frontend/islands/media-slideshow.js": () => __vitePreload(() => import("components/media-slideshow"), true ? [] : void 0, import.meta.url), "/frontend/islands/modal-predictive-search.js": () => __vitePreload(() => import("components/modal-predictive-search"), true ? [] : void 0, import.meta.url), "/frontend/islands/password-modal.js": () => __vitePreload(() => import("components/password-modal"), true ? [] : void 0, import.meta.url), "/frontend/islands/pickup-availability-drawer.js": () => __vitePreload(() => import("components/pickup-availability-drawer"), true ? [] : void 0, import.meta.url), "/frontend/islands/pickup-availability.js": () => __vitePreload(() => import("components/pickup-availability"), true ? [] : void 0, import.meta.url), "/frontend/islands/popup-modal.js": () => __vitePreload(() => import("components/popup-modal"), true ? [] : void 0, import.meta.url), "/frontend/islands/predictive-search.js": () => __vitePreload(() => import("components/predictive-search"), true ? [] : void 0, import.meta.url), "/frontend/islands/product-card.js": () => __vitePreload(() => import("components/product-card"), true ? [] : void 0, import.meta.url), "/frontend/islands/product-details-modal.js": () => __vitePreload(() => import("components/product-details-modal"), true ? [] : void 0, import.meta.url), "/frontend/islands/product-form.js": () => __vitePreload(() => import("components/product-form"), true ? [] : void 0, import.meta.url), "/frontend/islands/product-model.js": () => __vitePreload(() => import("components/product-model"), true ? [] : void 0, import.meta.url), "/frontend/islands/product-recommendations.js": () => __vitePreload(() => import("components/product-recommendations"), true ? [] : void 0, import.meta.url), "/frontend/islands/promo-section.js": () => __vitePreload(() => import("components/promo-section"), true ? [] : void 0, import.meta.url), "/frontend/islands/quantity-select.js": () => __vitePreload(() => import("components/quantity-select"), true ? [] : void 0, import.meta.url), "/frontend/islands/slideshow-component.js": () => __vitePreload(() => import("components/slideshow-component"), true ? [] : void 0, import.meta.url), "/frontend/islands/swatch-radios.js": () => __vitePreload(() => import("components/swatch-radios"), true ? [] : void 0, import.meta.url), "/frontend/islands/testimonials-component.js": () => __vitePreload(() => import("components/testimonials-component"), true ? [] : void 0, import.meta.url), "/frontend/islands/variant-radios.js": () => __vitePreload(() => import("components/variant-radios"), true ? [] : void 0, import.meta.url), "/frontend/islands/variant-selects.js": () => __vitePreload(() => import("components/variant-selects"), true ? [] : void 0, import.meta.url), "/frontend/islands/video-background-object.js": () => __vitePreload(() => import("components/video-background-object"), true ? [] : void 0, import.meta.url), "/frontend/islands/video-background.js": () => __vitePreload(() => import("components/video-background"), true ? [] : void 0, import.meta.url), "/frontend/islands/video-object.js": () => __vitePreload(() => import("components/video-object"), true ? [] : void 0, import.meta.url) });
function revive(islands2) {
  const observer = new window.MutationObserver((mutations) => {
    for (let i = 0; i < mutations.length; i++) {
      const { addedNodes } = mutations[i];
      for (let j = 0; j < addedNodes.length; j++) {
        const node = addedNodes[j];
        if (node.nodeType === 1) dfs(node);
      }
    }
  });
  async function dfs(node) {
    const tagName = node.tagName.toLowerCase();
    const potentialJsPath = `/frontend/islands/${tagName}.js`;
    const isPotentialCustomElementName = /-/.test(tagName);
    if (isPotentialCustomElementName && islands2[potentialJsPath]) {
      if (node.hasAttribute("client:visible")) {
        await visible({ element: node });
      }
      const clientMedia = node.getAttribute("client:media");
      if (clientMedia) {
        await media({ query: clientMedia });
      }
      if (node.hasAttribute("client:idle")) {
        await idle();
      }
      islands2[potentialJsPath]();
    }
    let child = node.firstElementChild;
    while (child) {
      dfs(child);
      child = child.nextElementSibling;
    }
  }
  dfs(document.body);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
revive(islands);
theme.userInteraction = false;
const userInteractionEvents = ["mouseover", "keydown", "scroll", "touchstart"];
document.addEventListener("DOMContentLoaded", () => {
  userInteractionEvents.forEach((eventName) => {
    document.addEventListener(eventName, onUserInteraction, {
      passive: true
    });
  });
});
function onUserInteraction() {
  theme.userInteraction = true;
  userInteractionEvents.forEach((event) => {
    document.removeEventListener(event, onUserInteraction, {
      passive: true
    });
  });
}
theme.isTouchDevice = () => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
};
theme.debounce = (fn, wait) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(void 0, args), wait);
  };
};
theme.fetchConfig = (type = "json") => {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: `application/${type}`
    }
  };
};
theme.pauseAllMedia = () => {
  document.querySelectorAll(".js-youtube").forEach((video) => {
    video.contentWindow.postMessage(
      '{"event":"command","func":"pauseVideo","args":""}',
      "*"
    );
  });
  document.querySelectorAll(".js-vimeo").forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', "*");
  });
  document.querySelectorAll("video").forEach((video) => video.pause());
  document.querySelectorAll("product-model").forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
};
