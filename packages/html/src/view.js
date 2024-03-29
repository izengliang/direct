import { Template } from "./template.js";
import { runDirective } from "./directive.js";

class View {
  static create(members) {
    const view = new View();
    Object.assign(view, members);
    return view;
  }

  /**
   * @type { Node[] } nodes;
   */
  #nodes = [];

  /**
   * @type {ValueSlot[]}
   */
  #slots = [];

  /**
   * @type {Template}
   */
  #template;

  /**
   * @type {DocumentFragment}
   */
  #fragment;

  #strings;

  /**
   *
   * @param {import("./types").TemplateResult} templateResult
   */
  render(templateResult) {
    if (this.#isDestory) {
      console.warn("this view is destory!");
      return;
    }
    const strings = templateResult.strings.join("-");
    if (this.#strings !== strings) {
      if (this.#strings !== undefined) {
        this.#destory();
      }

      this.#template = new Template(templateResult);
      const [fragment, slots] = this.#template.generate();
      this.#slots = slots;
      this.#strings = strings;
      this.#fragment = fragment;
      this.#nodes = [...fragment.childNodes];
    }
    templateResult.values.forEach((value, i) => {
      const slot = this.#slots[i];
      if (slot) {
        slot.view = this;
        slot.render(
          value && value.isDirectiveResult ? runDirective(slot, value) : value
        );
      }
    });
  }

  get nodes() {
    return [...this.#nodes];
  }

  #isDestory = false;

  get isDestory() {
    return this.#isDestory;
  }

  get fragment() {
    this.#fragment.append(...this.#nodes);
    return this.#fragment;
  }

  destory() {
    this.#isDestory = true;
    this.#destory();
  }

  hide() {
    this.fragment;
  }

  #destory() {
    this.#nodes.forEach((n) => n.remove());
    this.#slots.forEach((slot) => {
      slot.destory();
    });
  }
}
export { View };
