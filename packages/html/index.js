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

const templateCache = new Map();

/**
 * @enum {number}
 */
export const ValueType = {
  EVENT: 0,
  PROPERTY: 1,
  ATTRIBUTE: 2,
  DIRECTIVE: 3,
  TEMPLATE_RESULT: 4,
};

Object.freeze(ValueType);

/**
 * value information
 *
 * @typedef ValueInfo
 * @property { Element } [host]
 * @property { Comment } [marker] - When the position of value is the child of the host.
 * @property { number } position - value index from values.
 * @property { string } [propertyName]
 * @property { string } [eventName]
 * @property { string } [attributeName]
 * @property { ValueType } type
 *
 */

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

  #markedTemplateString;

  /**
   * mark value position info.
   */
  #mark() {
    let template = "";

    const strings = this.strings;
    for (let i = 0; i < strings.length - 1; i++) {
      const s = strings[i];

      // is event handler
      if (/\s*@(\w*)=\s*$/.test(s)) {
        const eventName = RegExp.$1;
        const s = RegExp["$`"];
        template += s;
        template += ` data-___marker-${i}='${JSON.stringify({
          position: i,
          eventName,
          type: ValueType.EVENT,
        })}'`;
      } else if (/\s*\.(\w*)=\s*$/.test(s)) {
        const s = RegExp["$`"];
        const propertyName = RegExp.$1;
        template += s;
        template += ` data-___marker-${i}='${JSON.stringify({
          position: i,
          type: ValueType.PROPERTY,
          propertyName,
        })}'`;
      } else if (/\s*(\w*)=\s*$/.test(s)) {
        const attributeName = RegExp.$1;
        const s = RegExp["$`"];
        template += s;
        template += ` data-___marker-${i}='${JSON.stringify({
          index: i,
          type: ValueType.ATTRIBUTE,
          attributeName,
        })}'`;
      } else {
        const beforeString = strings.slice(0, i).join("");
        const tagIndex = beforeString.lastIndexOf("<");

        if (
          tagIndex !== -1 &&
          /^<[a-z][A-Za-z0-9_\-]*(\s|.*\s)$/.test(beforeString.slice(tagIndex))
        ) {
          template += s;
          template += ` data-___marker-${i}='${JSON.stringify({
            index: i,
            type: ValueType.DIRECTIVE,
          })}'`;
        } else {
          template += s;
          template += `<!--data-___marker-${i}=${JSON.stringify({
            index: i,
          })}-->`;
        }
      }
    }
    this.#markedTemplateString = template;
  }

  /**
   * @type {DocumentFragment}
   */
  #templateFragment;

  createTemplateFragment() {
    if (!this.#templateFragment) {
      const template = document.createElement("template");
      template.innerHTML = this.#markedTemplateString;
      this.#templateFragment = template.content;
    }
  }

  createTemplateResult() {
    if (!this.#templateFragment) {
      this.createTemplateFragment();
    }
    const valueInfos = [];
    const templateFragment = this.#templateFragment.cloneNode(true);
    const elements = templateFragment.querySelectorAll("*");
    for (let n of elements) {
      for (let mark in n.dataset) {
        if (/^___marker\-\d+$/.test(mark)) {
          valueInfos.push({
            ...info,
            host: n, // link host
          });
          delete n.dataset[mark];
        }
      }
    }

    const comments = getAllComments(templateFragment);
    comments.forEach((comment) => {
      const commentText = comment.textContent;
      if (/^data-___marker\-\d+=(.*)/.test(commentText)) {
        const info = JSON.parse(RegExp.$1);
        valueInfos.push({
          ...info,
          marker: commentText,
          host: n.parentNode,
        });
      }
    });

    return new TemplateResult(templateFragment, valueInfos);
  }
}

/**
 * template result
 */
class TemplateResult {
  /**
   * @type {DocumentFragment}
   */
  templateFragment;

  /**
   * @type {ValueInfo[]}
   */
  valueInfos;

  /**
   * @param {DocumentFragment} templateFragment;
   * @param {ValueInfo[]} valueInfos;
   */
  constructor(templateFragment, valueInfos) {
    this.templateFragment = templateFragment;
    this.valueInfos = valueInfos;
  }

  #oldValues;

  /**
   * @param {any[]} values
   */
  render(values) {
    for (let info of this.valueInfos) {
      const value = values[info.position];
      const oldValue = this.#oldValues[info.position];

      switch (info.type) {
        case ValueType.ATTRIBUTE:
          {
            info.host.setAttribute(info.attributeName, value);
          }
          break;
        case ValueType.EVENT:
          {
            oldValue && info.host.removeEventListener(info.eventName, oldValue);
            info.host.setAttribute(info.eventName, value);
          }
          break;
        case ValueType.PROPERTY:
          {
            info.host[info.propertyName] = value;
          }
          break;

        default:
          // TODO
          if (info.host) {
            if (value instanceof Directive) {
            }
          } else if (info.marker) {
            if (value instanceof Directive) {
            } else if (value instanceof TemplateResult) {
            }
          }
      }
    }
  }
}

/**
 *
 * @param {TemplateResult} template
 * @param {Element} containerElement
 * @param {*} opt
 */
export const render = (template, containerElement, opt) => {
  template.render();
  if (containerElement !== template[container]) {
    containerElement.append(template.fragment);
    template[container] = containerElement;
  }
};

class Directive {
  render(...values) {}
  update(part) {}
}
