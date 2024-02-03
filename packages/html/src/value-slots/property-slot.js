import { ValueSlot } from "./value-slot.js";

class PropertySlot extends ValueSlot {
  /**
   * @type {string}
   */
  property;

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
    if (value !== this.host[this.property]) {
      this.host[this.property] = value;
    }
  }
}

export { PropertySlot };
