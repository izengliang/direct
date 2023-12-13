export const ValueType = {
  EVENT: 0,
  ATTRIBUTE: 1,
  PROPERTY: 2,
  DIRECTIVE: 3,
};
/**
 *
 * @param {Element} dom
 * @returns {Comment[]}
 */
export const getAllComments = (dom) => {
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
/**
 * slot
 */
export class ValueSlot {
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
  isChild;

  /**
   * if isChild = true , must provide it.
   * @type {?Comment}
   */
  marker;

  prveValue;

  /**
   * TODO
   * change node's attributes / properties / events / children
   * @param {SlotValue} value
   */
  setValue(value) {
    if (this.prevHandler !== value) {
      if (typeof value === "string" || typeof value === "number") {
        value = String(value);
        if (!this.node) {
          this.node = new Text();
          this.host.insertBefore(this.node, this.marker);
        }
        this.node.textContent = value;
      }
    }

    this.prevValue = value;
  }
}

class AttributeSlot extends ValueSlot {
  /**
   * @type {string}
   */
  attribute;

  prevValue;

  setValue(value) {
    if (value !== this.prevValue) {
      this.host.setAttribute(this.attribute, value);
    }
    this.prevValue = value;
  }
}

class PropertySlot extends ValueSlot {
  /**
   * @type {string}
   */
  property;

  prevValue;

  setValue(value) {
    if (value !== this.prevValue) {
      this.host[this.property] = value;
    }
    this.prevValue = value;
  }
}

class EventSlot extends ValueSlot {
  /**
   * @type {string}
   */
  event;

  prevHandler;

  setValue(handler) {
    if (!handler && this.prevHandler) {
      this.host.removeEventListener(this.event, this.prevHandler);
    } else if (this.prevHandler !== handler) {
      this.host.removeEventListener(this.event, this.prevHandler);
      this.host.addEventListener(this.event, handler);
    }

    this.prevHandler = handler;
  }
}

class DirectiveSlot extends ValueSlot {
  /**
   * @param {Directive} directive
   */
  setValue(directive) {}
}

// dynamic
export class View {
  /**
   *
   * @param {Template} template
   */
  constructor(template) {
    this.template = template;
    const [fragment, slots] = template.generate();
    this.slots = slots;
    this.nodes = [...fragment.children];
  }

  fragment;

  /**
   * @type { Node[] } nodes;
   */
  nodes = [];

  /**
   * @type {ViewSlot[]}
   */
  slots;

  /**
   * @type {Template}
   */
  template;

  render(values) {
    values &&
      values.forEach((value, i) => {
        this.slots[i].setValue(value);
      });
  }

  // TODO
  remove() {}
}

/**
 * @typedef  TemplateResult
 * @property { string[] } strings
 * @property { any[] } values
 * @property { boolean } isTemplateResult
 *
 * @typedef DirectiveResult
 * @property { any[] } args
 * @property { boolean } isDirectiveResult
 *
 * @typedef { string | number | boolean | TemplateResult | TemplateResult[] | DirectiveResult } SlotValue
 */

export class Directive {
  /**
   *
   * @param {ValueSlot} slot
   */
  render(slot) {}
}

/**
 * @param {typeof Directive} C
 * @returns {DirectiveResult}
 */
export const directive = (C) => {};

// static template
export class Template {
  /**
   * @readonly
   * @type {string[]}
   */
  strings;
  constructor(strings) {
    this.strings = strings;
    this.#mark();
  }

  /**
   * mark value position info.
   */
  #mark() {
    const strings = this.strings;
    let template = "";

    for (let i = 0; i < strings.length - 1; i++) {
      const s = strings[i];
      // is event handler
      if (/\s*@(\w*)=\s*$/.test(s)) {
        const eventName = RegExp.$1;
        const $s = RegExp["$`"];
        template += $s;
        template += ` data-___marker-${i}='${JSON.stringify({
          position: i,
          eventName,
          type: ValueType.EVENT,
        })}'`;
      } else if (/\s*\.(\w*)=\s*$/.test(s)) {
        const $s = RegExp["$`"];
        template += $s;
        const propertyName = RegExp.$1;
        template += ` data-___marker-${i}='${JSON.stringify({
          position: i,
          type: ValueType.PROPERTY,
          propertyName,
        })}'`;
      } else if (/\s*(\w*)=\s*$/.test(s)) {
        const attributeName = RegExp.$1;
        const $s = RegExp["$`"];
        template += $s;
        template += ` data-___marker-${i}='${JSON.stringify({
          position: i,
          type: ValueType.ATTRIBUTE,
          attributeName,
        })}'`;
      } else {
        const beforeString = strings.slice(0, i).join("");
        const tagIndex = beforeString.lastIndexOf("<");
        template += s;
        if (
          tagIndex !== -1 &&
          /^<[a-z][A-Za-z0-9_\-]*(\s|.*\s)$/.test(beforeString.slice(tagIndex))
        ) {
          template += ` data-___marker-${i}='${JSON.stringify({
            position: i,
            type: ValueType.DIRECTIVE,
          })}'`;
        } else {
          template += `<!--data-___marker-${i}=${JSON.stringify({
            position: i,
          })}-->`;
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
    /**
     * @type  {NodeList}
     */
    const elements = templateFragment.querySelectorAll("*");
    elements.forEach((n) => {
      for (let mark in n.dataset) {
        if (/^___marker\-\d+$/.test(mark)) {
          const info = JSON.parse(n.dataset[mark]);

          switch (info.type) {
            case ValueType.ATTRIBUTE:
              {
                const slot = new AttributeSlot();
                slot.attribute = info.attributeName;
                slot.position = info.position;
                slot.host = n;
                slot.isChild = true;
                slots[info.position] = slot;
              }
              break;
            case ValueType.PROPERTY:
              {
                const slot = new PropertySlot();
                slot.property = info.propertyName;
                slot.position = info.position;
                slot.host = n;
                slot.isChild = true;

                slots[info.position] = slot;
              }
              break;
            case ValueType.EVENT:
              {
                const slot = new EventSlot();
                slot.event = info.eventName;
                slot.position = info.position;
                slot.isChild = true;

                slot.host = n;
                slots[info.position] = slot;
              }
              break;
            case ValueType.DIRECTIVE:
              const slot = new DirectiveSlot();
              slots[info.position] = slot;
              slot.isChild = true;
              break;
          }

          delete n.dataset[mark];
        }
      }
    });

    const comments = getAllComments(templateFragment);
    comments.forEach((comment) => {
      const commentText = comment.textContent;
      if (/^data-___marker\-\d+=(.*)/.test(commentText)) {
        const info = JSON.parse(RegExp.$1);
        const slot = new ValueSlot();
        slot.position = info.position;
        slot.marker = comment;
        slot.host = comment.parentElement;
        slots[info.position] = slot;
      }
    });

    return [templateFragment, slots];
  }
}

export const html = (strings, ...values) => {
  return { strings, values };
};

/**
 *
 * @param {TemplateResult} templateResult
 * @param {Element} container
 * @param { { cid?:string } } options - top provide cid.  part id.
 */
export const render = (templateResult, container, options = {}) => {
  let view = container[options.cid || ""];
  if (!view) {
    const template = new Template(templateResult.strings);
    view = new View(template);
    container[options.cid || ""] = view;
    container.append(...view.nodes);
  }
  view.render(templateResult.values);
  return view;
};
