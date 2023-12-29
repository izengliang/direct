import { ValueSlot } from "./value-slot.js";

class EventSlot extends ValueSlot {
  /**
   * @type {string}
   */
  event;

  _prevHandler;

  isChild = false;

  /**
   * @param {string} event
   * @param {number} position
   */
  constructor(event, position) {
    super();
    this.event = event;
    this.position = position;
  }

  render(handler) {
    if (!handler && this._prevHandler) {
      this.host.removeEventListener(this.event, this._prevHandler);
    } else if (this._prevHandler !== handler) {
      this.host.removeEventListener(this.event, this._prevHandler);
      this.host.addEventListener(this.event, handler);
    }

    this._prevHandler = handler;
  }
}

export { EventSlot };
