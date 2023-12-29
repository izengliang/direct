import { Directive, directive } from "@izengliang/direct-html";

class ModelWatch extends Directive {
  /**
   *
   * @param {Backbone.Model} model
   * @param {string} [key]
   */
  render(model, key) {
    if (this._prevModel !== model) {
      this.destory();
      this._prevModel = model;
      this._prevKey = key;
      if (key) {
        model.on("change:" + key, this.handler, this);
        this.value = model.get(key);
      } else {
        model.on("change", this.handler, this);
        this.value = model.toJSON();
      }
    }

    return this.value;
  }

  destory() {
    if (this._prevModel) {
      if (this._prevKey) {
        this._prevModel.off("change:" + key, this.handler);
      } else {
        this._prevModel.off("change", this.handler);
      }
    }
  }

  value;

  handler() {
    if (this._prevKey) {
      this.value = this._prevModel.get(this._prevKey);
    } else {
      this.value = this._prevModel.toJSON();
    }
    this.slot.rerender();
  }
}

const watch = directive(ModelWatch);

export { watch };
