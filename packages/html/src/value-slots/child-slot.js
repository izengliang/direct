import { ValueSlot } from "./value-slot.js";
import { View } from "../view.js";

class ChildSlot extends ValueSlot {
  _prevValue;
  isChild = true;

  /**
   * @type {(View | Node)[]}
   */
  _items = [];

  /**
   * @param {number} position
   */
  constructor(position) {
    super();
    this.position = position;
  }

  _destory(startIndex = 0) {
    for (let i = startIndex, len = this._items.length; i < len; i++) {
      const item = this._items[i];
      if (item instanceof View) {
        item.__$internal ? item.destory() : item.hide();
      } else {
        item.remove();
      }
    }
  }

  render(value) {
    // console.log("value" , value)
    if (this._prevValue != value) {
      if (typeof value === "string" || typeof value === "number") {
        value = value + "";
        if (this._items[0] instanceof Text) {
          this._items[0].textContent = value;
          this._destory(1);
        } else {
          this._destory();
          this._items = [new Text(value)];
        }
      } else if (value instanceof View) {
        if (this._items[0] instanceof View) {
          this._destory();
        }
        this._items = [value];
      } else if (value instanceof Node) {
        this._destory();
        this._items = [value];
      } else if (value.isTemplateResult) {
        if (this._items[0] instanceof View) {
          this._items[0].render(value);
          this._destory(1);
        } else {
          this._destory();
          const view = new View();
          view.__$internal = true;
          view.render(value);
          this._items = [view];
        }
      } else if (Array.isArray(value)) {
        for (let i = 0, len = value.length; i < len; i++) {
          let n = value[i];
          const o = this._items[i];

          if (n.isTemplateResult) {
            if (o instanceof View) {
              o.render(n);
            } else if (o) {
              o.remove();
              const view = new View();
              view.__$internal = true;

              view.render(n);
              this._items[i] = view;
            } else {
              const view = new View();
              view.__$internal = true;

              view.render(n);
              this._items[i] = view;
            }
          } else if (n instanceof Node) {
            this._items[i] = n;
          } else if (n instanceof View) {
            if (o instanceof View) {
              if (n !== o) {
                o.destory();
              }
            } else if (o) {
              o.remove();
            }
            n.__$internal = true;
            this._items[i] = n;
          } else {
            n = n ? n.toString() : "";
            if (o) {
              if (o instanceof Text) {
                o.textContent = n;
              } else if (o instanceof Node) {
                o.remove();
                this._items[i] = new Text(n);
              } else {
                o.destory();
                this._items[i] = new Text(n);
              }
            } else {
              this._items[i] = new Text(n);
            }
          }
        }

        const newItems = this._items.slice(0, value.length);
        const delItems = this._items.slice(value.length);
        this._items = newItems;
        delItems.forEach((item) => {
          if (item instanceof View) {
            item.__$internal ? item.destory() : item.hide();
          } else if (item instanceof Node) {
            item.remove();
          }
        });
      }

      this._prevValue = value;

      const fragment = document.createDocumentFragment();

      const nodes = [];

      this._items.forEach((item) =>
        item instanceof View ? nodes.push(...item.nodes) : nodes.push(item)
      );

      fragment.append(...nodes);

      this.marker.parentElement.insertBefore(fragment, this.marker);
    }
  }
}

export { ChildSlot };
