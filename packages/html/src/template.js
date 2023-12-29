import { slotParsers } from "./value-slots/index.js";
/**
 *
 * @param {Element} dom
 * @returns {Comment[]}
 */
const getAllComments = (dom) => {
  /** @type {Comment[]} */
  let comments = [];
  const find = (dom) => {
    dom.childNodes.forEach((n) => {
      if (n.nodeType === Node.COMMENT_NODE) {
        comments.push(n);
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        find(n);
      }
    });
  };
  find(dom);
  return comments;
};
class Template {
  /**
   * @readonly
   * @type { import("./types.js").TemplateResult }
   */
  templateResult;

  /**
   *
   * @param { import("./types.js").TemplateResult } templateResult
   */
  constructor(templateResult) {
    this.templateResult = templateResult;
    this.#mark();
  }

  slots = [];

  /**
   * mark slot position info.
   */
  #mark() {
    const slots = this.slots;
    const strings = this.templateResult.strings;
    let template = "";
    let beforeString = "";

    for (let i = 0; i < strings.length - 1; i++) {
      const s = strings[i];
      beforeString += s;
      const tagIndex = beforeString.lastIndexOf("<");
      const substr = beforeString.slice(tagIndex);
      let isChild = true;

      if (
        tagIndex !== -1 &&
        substr.lastIndexOf(">") === -1 &&
        /^<\s*[a-z][A-Za-z0-9_\-]*\s*/.test(substr)
      ) {
        isChild = false;
      }

      for (let parser of slotParsers) {
        const result = parser(s, i, isChild);
        if (result) {
          template += result[0];
          template += isChild
            ? `<!--data-___marker-${i}-->`
            : ` data-___marker-${i} `;
          slots[i] = result[1];
          break;
        }
      }
    }
    template += strings.at(-1);

    if (!this.#templateFragment) {
      const templateElement = document.createElement("template");
      templateElement.innerHTML = template;
      this.#templateFragment = templateElement.content;
    }
  }

  /**
   * @type {DocumentFragment}
   */
  #templateFragment;

  /**
   * @returns  { [DocumentFragment, ValueSlot[]] }
   */
  generate() {
    const templateFragment = this.#templateFragment.cloneNode(true);

    const slots = [];
    // clone
    for (let slot of this.slots) {
      slots.push(Object.create(slot));
    }

    /**
     * @type  {NodeList}
     */
    const elements = templateFragment.querySelectorAll("*");

    // bind host.
    elements.forEach((n) => {
      for (let mark in n.dataset) {
        if (/^___marker\-(\d+)$/.test(mark)) {
          const i = Number(RegExp.$1);
          this.slots[i].host = n;
          delete n.dataset[mark];
        }
      }
    });

    const comments = getAllComments(templateFragment);
    comments.forEach((comment) => {
      const commentText = comment.textContent;
      if (/^data-___marker\-(\d+)/.test(commentText)) {
        const i = Number(RegExp.$1);
        const slot = slots[i];
        slot.marker = comment;
        slot.host = comment.parentElement;
      }
    });

    return [templateFragment, slots];
  }
}
export { Template };
