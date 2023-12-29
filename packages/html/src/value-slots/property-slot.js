import { ValueSlot } from "./value-slot.js";

class PropertySlot extends ValueSlot {
  /**
   * @type {string}
   */
  property;

  _prevValue;

  isChild = false;

  /**
   * @param {string} property
   * @param {string} position
   */
  constructor(property, position) {
    super();
    this.property = property;
    this.position = position;
  }

  render(value) {
    if (value !== this._prevValue) {
      this.host[this.property] = value;
      this._prevValue = value;
    }
  }
}

export { PropertySlot };
