import { c as createFocusTrap } from "vendors/focus-trap.esm";
class HeaderSection extends HTMLElement {
  constructor() {
    super();
    this.headerWrapper = this.querySelector(".header-wrapper");
    this.sticky = JSON.parse(this.headerWrapper.dataset.sticky);
    if (this.sticky) {
      this.setResizeObserver();
      this.setTopPosition();
    }
    this.menuButton = this.querySelector("button[data-menu-drawer-button]");
    if (!this.menuButton) return;
    const topHeader = document.querySelector("header-top-section");
    if (topHeader) {
      this.menuDrawer = topHeader.querySelector("menu-drawer");
      this.menuButton.addEventListener("click", (event) => {
        event.preventDefault();
        topHeader.openMenu(event);
      });
    } else {
      this.menuDrawer = this.querySelector("menu-drawer");
      this.modalBackground = this.querySelector(".modal__background");
      this.modalClose = this.querySelector(".modal__close");
      this.focusTrap = createFocusTrap(this.menuDrawer, {
        initialFocus: false
      });
      this.bindEvents();
    }
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
      headerGroup.querySelector(".header-wrapper");
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
          "--header-section-height",
          `${height}px`
        );
      }
    });
    resizeObserver.observe(this);
  }
  bindEvents() {
    this.menuButton.addEventListener("click", (event) => this.openMenu(event));
    this.modalBackground.addEventListener(
      "click",
      (event) => this.closeMenu(event)
    );
    this.modalClose.addEventListener("click", (event) => this.closeMenu(event));
    this.addEventListener("keyup", (event) => this.menuKeyUp(event));
  }
  openMenu(event) {
    event.preventDefault();
    this.parentElement.style.zIndex = 1e3;
    this.menuButton.setAttribute("aria-expanded", true);
    this.menuDrawer.setAttribute("open", true);
    document.body.classList.add("has-modal");
    this.focusTrap.activate();
  }
  menuKeyUp(event) {
    if (event.code.toUpperCase() !== "ESCAPE") return;
    this.closeMenu(event);
  }
  closeMenu(event) {
    event.preventDefault();
    this.parentElement.style.zIndex = "";
    this.menuButton.setAttribute("aria-expanded", false);
    this.menuDrawer.removeAttribute("open");
    document.body.classList.remove("has-modal");
    this.focusTrap.deactivate();
  }
}
customElements.define("header-section", HeaderSection);
