function stringsToHash(strings) {
  const string = strings.join("");
  let hash = 0;

  if (string.length == 0) return hash;

  for (let i = 0; i < string.length; i++) {
    let char = string.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return "t" + hash;
}

/**
 * value information
 *
 * @typedef ValueInfo
 * @property { Element } [host]
 * @property { Element } [node]
 * @property { Comment } [marker] - When the position of value is the child of the host.
 * @property { number } position - value index from values.
 * @property { string } [propertyName]
 * @property { string } [eventName]
 * @property { string } [attributeName]
 * @property { Directive } [directive]
 * @property { ValueType } type
 *
 */

/**
 * @typedef { {strings: string[] ; values: any[] ; isTemplateResult: true} } TemplateResult
 */

/**
 * @typedef {{ Class: typeof Directive , isDirectiveResult: true, values: any[] }} DirectiveResult
 */

export const nothing = Symbol();

const templateSourceCache = new WeakMap();
const templateStringsCache = new WeakMap();

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

export class TemplateSource {
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

  /**
   * @Todo Can be separated into two parts: slot and node.
   * @returns { Template }
   */
  createTemplate() {
    if (!this.#templateFragment) {
      this.createTemplateFragment();
    }
    const valueInfos = [];
    const templateFragment = this.#templateFragment.cloneNode(true);
    /**
     * @type  {NodeList}
     */
    const elements = templateFragment.querySelectorAll("*");
    elements.forEach((n, i, parent) => {
      for (let mark in n.dataset) {
        if (/^___marker\-\d+$/.test(mark)) {
          const info = JSON.parse(n.dataset[mark]);
          valueInfos.push({
            ...info,
            host: n, // link host index
          });
          delete n.dataset[mark];
        }
      }
    });

    const comments = getAllComments(templateFragment);
    comments.forEach((comment) => {
      const commentText = comment.textContent;
      if (/^data-___marker\-\d+=(.*)/.test(commentText)) {
        const info = JSON.parse(RegExp.$1);
        valueInfos.push({
          ...info,
          marker: comment,
          host: comment.parentNode,
        });
      }
    });
    return new Template(templateFragment, valueInfos);
  }
}

export class Template {
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
      const oldValue = this.#oldValues && this.#oldValues[info.position];

      switch (info.type) {
        case ValueType.ATTRIBUTE:
          {
            if (!this.#oldValues || oldValue !== value) {
              info.host.setAttribute(info.attributeName, value);
            }
          }
          break;
        case ValueType.EVENT:
          {
            if (!this.#oldValues || oldValue !== value) {
              oldValue &&
                info.host.removeEventListener(info.eventName, oldValue);
              info.host.addEventListener(info.eventName, value);
            }
          }
          break;
        case ValueType.PROPERTY:
          {
            if (!this.#oldValues || oldValue !== value) {
              info.host[info.propertyName] = value;
            }
          }
          break;

        default:
          // the value is a directive.
          if (info.directive) {
            const result = info.directive.render(value.values);
            if (result !== nothing) {
              if (result instanceof TemplateResult) {
                // is child
                if (info.marker) {
                  //render TemplateResult

                  render(result, info.host);
                }
              } else {
                // when value position is child
                if (info.marker && result !== info.node) {
                  let newNode;
                  if (!(result instanceof Node)) {
                    newNode = new Text("" + result);
                  }

                  info.host.insertBefore(newNode, info.node || info.marker);
                  info.node.remove();
                  info.node = newNode;
                }
              }
            }
          } else if (info.marker) {
            // is child
            if (value.isDirectiveResult) {
              /**@type {Directive} */
              const directive = new value.Class({
                host: info.host,
                marker: info.marker,
                node: info.node,
              });
              info.directive = directive;
            } else if (value.isTemplateResult) {
              // render template
              render(value, info.host);
            } else if (typeof value === "string") {
              if (info.node) {
                info.node.textContent = value;
              } else {
                const node = new Text(value);
                info.node = node;
                info.host.insertBefore(node,info.marker);
              }
            }
          } else if (value.isDirectiveResult) {
            const directive = new value.Class({
              host: info.host,
              marker: info.markder,
              node: info.node,
            });
            info.directive = directive;
          }
      }
    }
    this.#oldValues = values;
  }
}

export const queryTemplateStrings = (strings) => {};

/**
 *
 * @param {TemplateResult} templateResult
 * @param {Element} containerElement
 * @param {*} opt
 */
export const render = (templateResult, containerElement) => {
  /**
   * @type {Template}
   */
  let template = containerElement["__$template"];
  if (!template) {
    /**
     * find strings object from doms.
     */
    const stringsId = stringsToHash(templateResult.strings);
    const node = document.querySelector(`data-template-strings-${stringsId}`);
    /**
     * @type {TemplateSource}
     */
    let templateSource;
    let strings;
    if (node) {
      strings = templateStringsCache.get(node);
      if (strings) {
        templateSource = templateSourceCache.get(strings);
      }
    }
    if (!templateSource) {
      if (!strings) {
        strings = templateResult.strings;
      }
      templateSource = new TemplateSource(strings);
      templateStringsCache.set(containerElement, strings);
      templateSourceCache.set(strings, templateSource);
      containerElement.setAttribute(`data-template-strings-${stringsId}`, "");
    }

    template = templateSource.createTemplate();

    containerElement["__$template"] = template;
    containerElement.appendChild(template.templateFragment);
  }

  template.render(templateResult.values);
};

export class Directive {
  constructor({ host, marker, node }) {}
  render(...values) {}
}

/**
 * @param { typeof Directive } C
 * @return { (...values: any[])=> DirectiveResult }
 */
export const directive = (C) => {
  return (...values) => ({ Class: C, isDirectiveResult: true, values });
};

export const html = (strings, ...values) => ({
  strings,
  values,
  isTemplateResult: true,
});
