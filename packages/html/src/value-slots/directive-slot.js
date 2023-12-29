import { ValueSlot } from "./value-slot.js";

class DirectiveSlot extends ValueSlot {
  /**
   * @param {number} position
   */
  constructor(position) {
    super();
    this.position = position;
  }

  isChild = false;
}
export { DirectiveSlot };
