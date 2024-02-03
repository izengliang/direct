import { html, View } from "@izengliang/direct-html";

class DirectElement extends HTMLElement {
  #view;
  #root;

  constructor() {
    super();
    this.#view = new View();
    this.#root = this.createRoot();
    const css = this.constructor.css || "";
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    this.adoptedStyleSheets.push(sheet);
  }

  get adoptedStyleSheets() {
    if (this.#root instanceof ShadowRoot) {
      return this.#root.adoptedStyleSheets;
    }
    return document.adoptedStyleSheets;
  }

  /**
   *
   * @returns {ShadowRoot | Element}
   */
  createRoot() {
    return this.attachShadow({ mode: "open" });
  }

  getRoot() {
    return this.#root;
  }

  connectedCallback() {
    this.requestRender();
  }

  #strings = "";

  requestRender() {
    let templateResult = this.render() || html``;

    if (!templateResult.isTemplateResult) {
      templateResult = html`${templateResult}`;
    }
    this.#view.render(templateResult);
    const strings = templateResult.strings.join("-");
    if (strings !== this.#strings) {
      this.#root.append(...this.#view.nodes);
      this.#strings = strings;
    }

  }

  render() {}
}

export { DirectElement };
