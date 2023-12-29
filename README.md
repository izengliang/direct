# Direct

Direct is a simple library for building fast, lightweight web components , can directly manipulate the dom structure.

# Playground

https://codepen.io/liangzeng/pen/BabNOQx

# Install

    npm install @izengliang/direct-html

CDN

```html
<script src="
https://cdn.jsdelivr.net/npm/@izengliang/direct-html/index.min.js
"></script>
```

# Use

```js
import { html, View } from "@izengliang/direct-html";

const view = new View();
const name = "leo";
view.render(html`<div>name is ${name}</div>`);

document.body.appendChild(view.fragment);
```

```js
import { html, View } from "@izengliang/direct-html";
class MyView extends View {
  constructor() {
    super();
    this.render();
  }

  #title = "";
  #content = "";

  set title(v) {
    this.#title = v;
  }

  set content(v) {
    this.#content = v;
  }

  render() {
    super.render(html`
    <article>
      <header>${this.#title}</header>
      <div>
          ${title.#content}
      </div>
    </artcile>
    `);
  }
}

const view = new MyView();
document.body.appendChild(view.fragment);
```

```js
// bind event

const click_handle = (e) => {};

html`<button @click=${click_handle}>click me !</button>`;
```

```js
// bind attribute

const mytitle = "direct not interfering with the mind.";
html`<article title=${mytitle}>direct is directly operate DOM !</article>`;
```

```js
// bind property

const myHTMLString =
  "<h1> static html content . direct not interfering with the mind.</h1>";
html`<article .innerHTML=${myHTMLString}>
  direct is directly operate DOM !
</article>`;
```

```js
// lists

const items = [0, 1, 2, 3, 4, 5, 6];

html`
  <ul>
    ${items.map((item) => html`<li>Item - ${item}</li>`)}
  </ul>
`;
```

```js
// bind class and style

const isBox = true;
const myColor = "green";

html`<article class.isBox=${isBox} style.backgroundColor=${myColor}>
  direct is directly operate DOM !
</article>`;
```

```js

// Support for extended syntax
// Custom Value Slot Parser

import { use } from "@izengliang/direct-html";

const slotParserPlugin = {
  slotParser: ... // Custom '%' Parser
}
use(slotParserPlugin);

const nodeRef = {};

html`<div %${nodeRef} ></div>`

// nodeRef.current is div's dom object.

```

```js
// Supports directive nesting, achieving infinite possibilities.

html`<div ${color(watch(obj, "color"))}></div>`;

// ColorDirective get the value of WatchDirective.
// When color changes, the view is automatically refreshed.
// Similar to signal .
```

# directives

### @izengliang/direct-model-watch

listen Backbone.Model to change slot value , similar signal.

```js
import { watch } from "@izengliang/direct-model-watch";

const m = new Backbone.Model();

const v = new View();

const change = (e) => {
  m.set("txt", e.target.value);
};

v.render(html`<div><input @input=${change} />${watch(m, "txt")}</div>`);

```
