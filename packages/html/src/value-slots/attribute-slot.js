import { ValueSlot } from "./value-slot.js";

class AttributeSlot extends ValueSlot {
  /**
   * @type {string}
   */
  attribute;

  _prevValue = "";

  isChild = false;

  /**
   * @param {string} attribute
   * @param {number} position
   */
  constructor(attribute, position) {
    super();
    this.attribute = attribute;
    this.position = position;
  }

  /**
   * @param {string} value
   */
  render(value) {
    if (value != this._prevValue) {
      this.host.setAttribute(this.attribute, value);
      this._prevValue = value;
    }
  }
}
export { AttributeSlot };
