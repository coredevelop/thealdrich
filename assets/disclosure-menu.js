class DisclosureMenu extends HTMLElement {
  constructor() {
    super();
    this.details = this.querySelector("details");
    this.detailsChildren = this.querySelectorAll(
      "details .list-menu:not([data-mega-menu]) details"
    );
    this.summary = this.querySelector("summary");
    this.details.addEventListener("click", (event) => this.onOpenPanel(event));
    this.addEventListener("keyup", (event) => this.panelKeyUp(event));
    if (this.details.classList.contains("header-menu__details")) {
      this.addEventListener("focusout", (event) => this.panelFocusCheck(event));
      this.addEventListener(
        "pointerenter",
        (event) => this.panelMouseEnter(event)
      );
      this.addEventListener(
        "pointerleave",
        (event) => this.panelMouseLeave(event)
      );
    }
    this.nav = this.closest("nav");
  }
  onOpenPanel(event) {
    const currentDetails = event.target.closest("details");
    this.detailsChildren.forEach((item) => {
      if (item == currentDetails) return;
      this.hidePanel(item);
    });
    if (this.nav) {
      const drawerSiblingDetails = this.nav.querySelectorAll(
        "details.drawer-menu__details"
      );
      drawerSiblingDetails.forEach((item) => {
        if (item === currentDetails || currentDetails.classList.contains("drawer-menu__details-child"))
          return;
        this.hidePanel(item);
      });
      const autoClosingDetails = this.nav.querySelectorAll(
        "details.footer-menu__details, details.menu__details"
      );
      autoClosingDetails.forEach((item) => {
        if (item === currentDetails || currentDetails.classList.contains("footer-menu__details-child") || currentDetails.classList.contains("menu__details-child"))
          return;
        this.hidePanel(item);
      });
    }
    window.theme.isMouseDevice = this.checkDeviceType(event);
    if (event.type === "click" && event.detail > 0) {
      if (window.theme.isMouseDevice && currentDetails.classList.contains("header-menu__details")) {
        window.location.href = currentDetails.dataset.link;
      }
    }
  }
  checkDeviceType(event) {
    let isMouseDevice = false;
    if (event.type === "mouseenter" || event.pointerType === "mouse") {
      isMouseDevice = true;
    }
    return isMouseDevice;
  }
  panelMouseEnter(event) {
    if (event.pointerType === "mouse") {
      this.openPanel(this.details);
      this.onOpenPanel(event);
    }
  }
  panelMouseLeave(event) {
    if (event.pointerType === "mouse") {
      this.hidePanel(this.details);
    }
  }
  panelFocusCheck(event) {
    if (event.relatedTarget === null || !this.contains(event.relatedTarget)) {
      this.hidePanel(this.details);
    }
  }
  panelKeyUp(event) {
    if (event.code.toUpperCase() !== "ESCAPE") return;
    const closestDetails = document.activeElement.closest("details");
    const closestSummary = closestDetails.querySelector("summary");
    this.hidePanel(closestDetails);
    closestSummary.focus();
  }
  openPanel(details) {
    details.setAttribute("open", true);
    const panelContent = details.querySelector("[data-accordion-panel]");
    if (panelContent) {
      panelContent.style.right = "auto";
      const rect = panelContent.getBoundingClientRect();
      if (rect.right > (window.innerWidth || document.documentElement.clientWidth)) {
        panelContent.style.right = "0px";
      }
    }
  }
  hidePanel(details) {
    details.removeAttribute("open");
  }
}
customElements.define("disclosure-menu", DisclosureMenu);
