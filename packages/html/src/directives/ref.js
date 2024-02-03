import { Directive, directive } from "../directive.js";

class Ref extends Directive {
  _obj;
  render(obj) {
    if (this._obj !== obj && !this.slot.isChild && typeof obj === "object") {
      obj.current = this.slot.host;
      this._obj = obj;
    }
  }
}

const ref = directive(Ref);

export { ref };
