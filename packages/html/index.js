export * from "./watch.js";

/**
 * @enum {number}
 */
export const ValueType = {
  EVENT: 8,
  ATTRIBUTE: 1,
  PROPERTY: 2,
  DIRECTIVE: 3,
  TEMPLATE_RESULT_ARRAY: 5,
  NODE: 6,
  STYLE: 7,
  CLASS: 9,
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

  views = [];

  directive;

  prveValue;

  prevValueType;

  // watchedObject;

  empty() {
    switch (this.valueType) {
      case ValueType.NODE:
        this.node?.remove();
        this.node = null;
        break;
      case ValueType.TEMPLATE_RESULT_ARRAY:
        this.views.forEach((view) => {
          view.remove();
        });
        this.views = [];
        break;
      case ValueType.DIRECTIVE:
        this.directive.remove(); // @todo
        this.directive = null;
        break;
    }
  }

  _emptyModel() {
    if (this.prevModel) {
      this.prevModel.off("change", this.onChange);
      this.prevModel = null;
    } else if (this.prevWatch) {
      this.prevWatch.model.off(
        "change" + this.prevWatch.attribute,
        this.onChange
      );
    }
  }

  setModelValue(value) {
    if (value && value instanceof Backbone.Model) {
      if (value !== this.prevModel) {
        this._emptyModel();
        this.onChange = (v) => {
          this.setValue(v.toJSON(), true);
        };

        value.on("change", this.onChange);
        this.prevModel = value;
        this.setValue(value.toJSON(), true);
      }

      return true;
    } else if (value && value.isWatch) {
      if (
        this.prevWatch &&
        (value.attribute !== this.prevWatch.attribute ||
          value.model !== this.prevWatch.model)
      ) {
        this._emptyModel();
      }
      this.onChange = (v) => {
        this.setValue(v.changed[this.prevWatch.attribute], true);
      };
      value.model.on("change:" + value.attribute, this.onChange);
      this.setValue(value.model.get(value.attribute), true);
      this.prevWatch = value;

      return true;
    }
  }

  /**
   * TODO
   * change node's attributes / properties / events / children
   * @param {SlotValue} value
   */
  setValue(value, internal) {
    if (!this.setModelValue(value)) {
      if (!internal) {
        this._emptyModel();
      }

      let valueType;

      if (value === undefined || value === null) {
        value = "";
      }

      const type = typeof value;
      let isBasicType = false;
      if (
        (isBasicType = ["string", "boolean", "number"].includes(type)) ||
        value instanceof Node
      ) {
        if (isBasicType) {
          value = new Text(value.toString());
          valueType = ValueType.NODE;
        }

        if (valueType === this.valueType) {
          if (this.prevValue !== value) {
            this.host.insertBefore(value, this.node);
            this.empty();
          }
        } else {
          this.empty();
          this.host.insertBefore(value, this.marker);
        }

        this.node = value;
      } else if (value.isDirectiveResult) {
        valueType = ValueType.DIRECTIVE;

        if (valueType === this.valueType) {
          if (value.Type === this.prevValue.Type) {
            let isSame = true;

            for (let i = 0, len = value.args.length; i < len; i++) {
              if (value.args[i] !== this.prevValue.args[i]) {
                isSame = false;
                break;
              }
            }

            if (!isSame) {
              this.directive.render(...value.args);
            }
          } else {
            this.empty();
            this.directive = new value.Type(this);
            directive.render(...value.args);
          }
        } else {
          this.empty();
          this.directive = new value.Type(this);
          directive.render(...value.args);
        }
      } else if (value.isTemplateResult || Array.isArray(value)) {
        if (value.isTemplateResult) {
          value = [value];
        }

        valueType = ValueType.TEMPLATE_RESULT_ARRAY;
        value = value.filter((v) => v.isTemplateResult);
        if (valueType === this.valueType) {
          const oldViews = [];
          const newViews = [];
          for (let i = 0, len = value.length; i < len; i++) {
            /**
             * @type {TemplateResult}
             */
            const v = value[i];

            /**
             * @type {DirectiveResult}
             */
            const directiveResult = v.values.find(
              (o) => o.isDirectiveResult && o.Type === UID
            );

            let uid = i;

            if (directiveResult) {
              uid = directiveResult.args[0];
            }

            let view = this.views.find((view) => view.uid === uid);
            if (view) {
              oldViews.push(view);
            } else {
              const t = new Template(v);
              view = new View(t);
              view.uid = uid;
              newViews.push(view);
            }
            view.render(v.values);
          }

          /**
           * @type {View[]}
           */
          const needRemoveViews = this.views.filter(
            (v) => !oldViews.find((ov) => ov === v)
          );

          needRemoveViews.forEach((v) => v.remove());

          const fragment = document.createDocumentFragment();
          newViews.forEach((v) => fragment.append(...v.nodes));

          this.views = [...oldViews, ...newViews];
          this.host.insertBefore(fragment, this.marker);
        } else {
          this.empty();

          const fragment = document.createDocumentFragment();
          for (let i = 0, len = value.length; i < len; i++) {
            /**
             * @type {TemplateResult}
             */
            const v = value[i];
            /**
             * @type {DirectiveResult}
             */
            const directiveResult = v.values.find(
              (o) => o.isDirectiveResult && o.Type === UID
            );
            let uid = i;
            if (directiveResult) {
              uid = directiveResult.args[0];
            }
            const template = new Template(v);
            const view = new View(template);

            view.render(v.values);

            this.views.push(view);
            view.uid = uid;
            fragment.append(...view.nodes);
          }

          this.host.insertBefore(fragment, this.marker);
        }
      }

      // if (this.prevHandler !== value) {
      //   if (typeof value === "string" || typeof value === "number") {
      //     value = String(value);
      //     if (!this.node) {
      //       this.node = new Text();
      //       this.host.insertBefore(this.node, this.marker);
      //     }
      //     this.node.textContent = value;
      //   }
      // }

      this.prevValue = value;
      this.valueType = valueType;
    }
  }

  remove() {}
}

class AttributeSlot extends ValueSlot {
  /**
   * @type {string}
   */
  attribute;

  prevValue;

  setValue(value, internal) {
    if (internal || !this.setModelValue(value)) {
      if (value !== this.prevValue) {
        if (this.attribute === "style" && typeof value === "object") {
          let styleStr = "";
          for (let k in value) {
            const v = value[k];
            const s = k.replace(/([A-Z])/g, (C) => {
              return "-" + C.toLowerCase();
            });
            styleStr += s + ":" + v + ";";
          }
          this.host.setAttribute("style", styleStr);
        } else if (
          this.attribute === "class" &&
          (typeof value === "object" || typeof value === "array")
        ) {
          if (this.prevClassArr) {
            this.host.classList.remove(...this.prevClassArr);
          }

          this.prevClassArr = [];
          if (typeof value === "object") {
            for (let k in value) {
              if (value[k]) {
                this.prevClassArr.push(k);
              }
            }
          } else {
            this.prevClassArr = value;
          }

          this.host.classList.add(...this.prevClassArr);
        } else {
          this.host.setAttribute(this.attribute, value);
        }
      }
      this.prevValue = value;
    }
  }
}

class ClassSlot extends ValueSlot {
  /**
   * @type {string}
   */
  className;

  prevValue;

  setValue(bool, internal) {
    if (internal || !this.setModelValue(bool)) {
      if (bool !== this.prevValue) {
        if (bool) {
          this.host.classList.add(this.className);
        } else {
          this.host.classList.remove(this.className);
        }
      }
      this.prevValue = bool;
    }
  }
}

class StyleSlot extends ValueSlot {
  /**
   * @type {string}
   */
  attributeName;

  prevValue;

  setValue(value, internal) {
    if (internal || !this.setModelValue(value)) {
      if (internal || value !== this.prevValue) {
        this.host.style[this.attributeName] = value;
      }
      this.prevValue = value;
    }
  }
}

class PropertySlot extends ValueSlot {
  /**
   * @type {string}
   */
  property;

  prevValue;

  setValue(value, internal) {
    if (internal || !this.setModelValue(value)) {
      if (value !== this.prevValue) {
        this.host[this.property] = value;
      }
      this.prevValue = value;
    }
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
   * @param {DirectiveResult} directive
   */
  setValue({ Type, args }) {
    if (!this.directive) {
      this.directive = new Type(this.view);
    } else if (!(this.directive instanceof Type)) {
      this.directive.remove();
      this.directive = new Type(this.view);
    }

    this.directive.render(...args);
  }
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

  /**
   * @type { Node[] } nodes;
   */
  nodes = [];

  /**
   * @type {ValueSlot[]}
   */
  slots;

  /**
   * @type {Template}
   */
  template;

  render(values) {
    values &&
      values.forEach((value, i) => {
        const slot = this.slots[i];
        if (slot) {
          slot.view = this;
          slot.setValue(value);
        }
      });
  }

  // TODO
  remove() {
    this.nodes.forEach((n) => n.remove());
    this.slots.forEach((slot) => slot.remove());
  }
}

/**
 * @typedef  TemplateResult
 * @property { string[] } strings
 * @property { any[] } values
 * @property { boolean } isTemplateResult
 *
 * @typedef DirectiveResult
 * @property { any[] } args
 * @property { typeof Directive } Type
 * @property { boolean } isDirectiveResult
 *
 */

export class Directive {
  constructor(view) {
    /**
     * @type {View}
     */
    this.view = view;
  }
  /**
   *
   * @param {ValueSlot} slot
   */
  render(slot) {}

  remove() {}
}

/**
 * @param {typeof Directive} C
 * @returns {DirectiveResult}
 */
export const directive = (Type) => {
  return (...args) => ({
    args,
    Type,
    isDirectiveResult: true,
  });
};

// static template
export class Template {
  /**
   * @readonly
   * @type {templateResult}
   */
  templateResult;

  /**
   *
   * @param {TemplateResult} templateResult
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
    for (let i = 0; i < strings.length - 1; i++) {
      const s = strings[i];
      // is event handler
      if (/\s+@(\w*)\s*=\s*$/.test(s)) {
        const eventName = RegExp.$1;
        const $s = RegExp["$`"];
        template += $s;

        template += ` data-___marker-${i} `;

        const slot = new EventSlot();
        slot.event = eventName;
        slot.position = i;
        slot.isChild = true;

        // slot.host = n;
        slots[i] = slot;
      } else if (/\s+\.(\w*)=\s*$/.test(s)) {
        const $s = RegExp["$`"];
        template += $s;
        template += ` data-___marker-${i} `;

        const propertyName = RegExp.$1;

        const slot = new PropertySlot();
        slot.property = propertyName;
        slot.position = i;
        // slot.host = n;
        slot.isChild = true;
        slots[i] = slot;
      } else if (/\s+(\w*)\s*=\s*$/.test(s)) {
        const attributeName = RegExp.$1;
        const $s = RegExp["$`"];
        template += $s;
        template += ` data-___marker-${i} `;

        const slot = new AttributeSlot();
        slot.attribute = attributeName;
        slot.position = i;
        // slot.host = n;
        slot.isChild = true;
        slots[i] = slot;
      } else if (/\s+style\.([a-zA-Z]\w*)\s*=\s*$/.test(s)) {
        const attributeName = RegExp.$1;

        const $s = RegExp["$`"];
        template += $s;
        template += ` data-___marker-${i} `;

        const slot = new StyleSlot();
        slot.attributeName = attributeName;
        slot.position = i;
        slot.isChild = true;

        // slot.host = n;
        slots[i] = slot;
      } else if (/\s*class\.([a-zA-Z]\w*)\s*=\s*$/.test(s)) {
        const className = RegExp.$1;
        const $s = RegExp["$`"];
        template += $s;
        template += ` data-___marker-${i} `;

        const slot = new ClassSlot();
        slot.className = className;
        slot.position = i;
        slot.isChild = true;
        // slot.host = n;
        slots[i] = slot;
      } else {
        template += s;
        const tagIndex = template.lastIndexOf("<");
        const substr = template.slice(tagIndex);
        if (
          tagIndex !== -1 &&
          substr.lastIndexOf(">") === -1 &&
          /^<\s*[a-z][A-Za-z0-9_\-]*\s*/.test(substr)
        ) {
          template += ` data-___marker-${i} `;

          const slot = new DirectiveSlot();
          slot.position = i;
          slot.isChild = true;
          slots[i] = slot;
          // slot.host = n;
        } else {
          template += `<!--data-___marker-${i}-->`;
          const slot = new ValueSlot();
          slot.position = i;
          slots[i] = slot;
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
    const slots = _.clone(this.slots);
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

export const html = (strings, ...values) => {
  return { strings, values, isTemplateResult: true };
};

/**
 *
 * @param {TemplateResult} templateResult
 * @param {Element} container
 * @param { { cid?:string } } options - top provide cid.  part id.
 */
export const render = (templateResult, container, options = {}) => {
  let view = container[options.cid || ""];
  if (view) {
    if (
      view.template.templateResult.strings.toString() !==
      templateResult.strings.toString()
    ) {
      view.remove();
      view = null;
    }
  }
  if (!view) {
    const template = new Template(templateResult);
    view = new View(template);
    container[options.cid || ""] = view;
    container.append(...view.nodes);
  }

  view.render(templateResult.values);
  return view;
};

export class UID extends Directive {
  render(id) {}
}

export const uid = directive(UID);
