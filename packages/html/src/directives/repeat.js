import { Directive, directive } from "../directive.js";
import { View } from "../view.js";

class RepeatDirective extends Directive {
  map = new Map();
  /**
   *
   * @param {any[]} items
   * @param {(any)=>string} keyFn
   * @param {(any,index)=> import("../types.js").TemplateResult } renderFn
   */
  render(items, keyFn, renderFn) {
    if (this.slot.isChild && items !== this._items) {
      const map = new Map();
      this._items = items;

      for (let i = 0, len = items.length; i < len; i++) {
        const item = items[i];
        const key = keyFn(item);
        let view = this.map.get(key) || View.create();
        view.render(renderFn(item, i));
        map.set(key, view);
      }

      for (let [key, view] of this.map) {
        if (!map.has(key)) {
          view.destory();
        }
      }

      this.map = map;

      const result = [...map.values()];
      this._result = result;
    }
    console.log(this._result);
    return this._result;
  }

  _result;
  _items = [];

  destory() {
    [...this.map.values()].forEach((view) => view.destory());
  }
}

const repeat = directive(RepeatDirective);

export { repeat };
