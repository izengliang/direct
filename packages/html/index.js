const weakmap = new WeakMap();

const container = Symbol.for("#container");

/**
 * template
 */
class TemplateResult {
  /**
   * @type {Element}
   */
  [container];

  /**
   * @type {DocumentFragment}
   */
  fragment;

  render() {}
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

const map = new Map();

/**
 * @typedef { { host: Element , event?:string, propname?:string, attrname?:string, index:number, type:"event"|"property"|"attribute",  value:any }[] } Value
 */

/**
 *
 * @param {string[]} strings
 * @param  {...any} values
 */
export function html(strings, ...values) {
  const key = strings.join();

  /**
   * @type { { values: Value[], template: HTMLTemplateElement } }
   */
  let templateResult = map.get(key);

  if (templateResult) {
    /**
     *  update values
     */
    const oldValues = templateResult.values;
    for (let oldValue of oldValues) {
      const newValue = values[oldValue.index];
      if (newValue !== oldValue.value) {
        switch (oldValue.type) {
          case "attribute":
            oldValue.host.setAttribute(oldValue.attrname, newValue);
            break;

          case "event":
            oldValue.host.removeEventListener(oldValue.event, oldValue.value);
            oldValue.host.addEventListener(oldValue.event, newValue);
            break;

          case "property":
            oldValue.host.setAttribute(oldValue.propname, newValue);
            break;
        }
      }
    }
  } else {
    let template = "";

    for (let i = 0; i < strings.length - 1; i++) {
      const s = strings[i];
      // is event handler
      if (/\s*@(\w*)=\s*$/.test(s)) {
        const eventname = RegExp.$1;
        const s = RegExp["$`"];
        template += s;
        template += ` data-___marker-${i}='${JSON.stringify({
          index: i,
          type: "event",
          event: eventname,
        })}'`;
      } else if (/\s*\.(\w*)=\s*$/.test(s)) {
        const s = RegExp["$`"];
        const propname = RegExp.$1;
        template += s;
        template += ` data-___marker-${i}='${JSON.stringify({
          index: i,
          type: "property",
          propname: propname,
        })}'`;
      } else if (/\s*(\w*)=\s*$/.test(s)) {
        const attrname = RegExp.$1;
        const s = RegExp["$`"];
        template += s;
        template += ` data-___marker-${i}='${JSON.stringify({
          index: i,
          type: "attribute",
          attrname: attrname,
        })}'`;
      } else {
        template += s;
        template += `data-___marker-${i}=''`;
      }
    }

    template += strings.at(-1);

    const t = document.createElement("template");
    t.innerHTML = template;
    /**
     * @type {Value[]}
     */
    const values_ = [];
    templateResult = { values: values_, template: t };
    map.set(key, templateResult);

    for (let n of t.content.children) {
      const link = { node: n, values: {} };
      for (let mark in n.dataset) {
        if (/^___marker\-\d+$/.test(mark)) {
          const info = JSON.parse(n.dataset[mark]);
          switch (info.type) {
            case "event":
              const eventhandler = values[info.index];
              n.addEventListener(info.event, eventhandler);
              values_.push({
                host: n,
                event: info.event,
                index: info.index,
                type: "event",
                value: eventhandler,
              });
              break;

            case "property":
              {
                const v = (n[info.propname] = values[info.index]);
                values_.push({
                  host: n,
                  propname: info.propname,
                  index: info.index,
                  type: "property",
                  value: v,
                });
              }

              break;

            case "attribute":
              {
                const v = values[info.index];
                n.setAttribute(info.attrname, v);
                values_.push({
                  host: n,
                  attrname: info.attrname,
                  index: info.index,
                  type: "attribute",
                  value: v,
                });
              }
              break;

            default: {
              const v = values[info.index];

              // Directive | string | other.toString()

              if (v instanceof Directive) {
                values_.push({
                  host: n,
                  index: info.index,
                  type: "directive",
                  value: v,
                });
              }
            }
          }
          delete n.dataset[mark];
        }
      }
    }

    // child  directive link dom!
    const dg = (node) => {
      for (let n of node.childNodes) {
        if (n.nodeType === Node.ELEMENT_NODE) {
          dg(n);
        } else if (n instanceof Text) {
          const texts = n.textContent.split(/\s*(___marker\-\d+\=\'\')/);

          for (let text of texts) {
            if (/___marker\-(\d+)\=''/.test(text)) {
              const i = RegExp.$1;
              const value = values[i];
              let part;
              if (value instanceof Directive) {
                part = new Comment();
                n.parentNode.insertBefore(part, n);
                part.values_.push({
                  host: part,
                  index: i,
                  type: "directive",
                  value: value,
                });

                const result = value.getValue();
                if (typeof result !== "undefined") {
                  console.log(result);
                  //   n.parentNode.insertBefore(result, part);
                }
              } else {
                part = new Text();
                // n.parentNode.insertBefore(part, n);
              }
            } else {
              //   n.parentNode.insertBefore(new Text(text), n);
            }
          }
        }
      }
    };

    dg(t.content);
    return t.content;
  }
}
