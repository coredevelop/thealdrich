import ProductDetailsModal from "components/product-details-modal";
import "vendors/focus-trap.esm";
class PasswordModal extends ProductDetailsModal {
  constructor() {
    super();
    console.log("PasswordModal");
  }
}
customElements.define("password-modal", PasswordModal);
