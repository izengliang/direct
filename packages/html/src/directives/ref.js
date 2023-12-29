import { Directive, directive } from "../directive.js";

class Ref extends Directive {
  render(obj) {
    if (!this.slot.isChild && typeof obj === "object") {
      obj.current = this.slot.host;
    }
  }
}

const ref = directive(Ref);

export { ref };
