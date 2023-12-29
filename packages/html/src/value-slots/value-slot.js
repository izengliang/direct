import { runDirective } from "../directive.js";
class ValueSlot {
  /**
   * @type {number}
   */
  position;

  /**
   * @type {Element}
   */
  host;

  /**
   * @type {boolean}
   */
  isChild = false;

  /**
   * if isChild = true , must provide it.
   * @type {?Comment}
   */
  marker;

  /**
   * @type { import("../directive").Directive[] }
   */
  _directives = [];

  render(value) {}

  rerender() {
    if (this._directiveResult) {
      this.render(runDirective(this, this._directiveResult));
    }
  }

  destory() {
    this._directives.forEach((directive) => {
      directive.destory();
    });
  }
}
export { ValueSlot };
