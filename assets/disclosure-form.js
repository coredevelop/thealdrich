import DisclosureItem from "components/disclosure-item";
class DisclosureForm extends DisclosureItem {
  constructor() {
    super();
    this.input = this.querySelector(
      'input[name="locale_code"], input[name="country_code"]'
    );
    this.form = this.querySelector("form");
    this.querySelectorAll("a").forEach(
      (item) => item.addEventListener("click", (event) => this.onItemClick(event))
    );
  }
  onItemClick(event) {
    event.preventDefault();
    this.input.value = event.currentTarget.dataset.value;
    if (this.form) {
      this.form.submit();
    }
  }
}
customElements.define("disclosure-form", DisclosureForm);
