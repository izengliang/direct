# Direct

Direct is a simple library for building fast, lightweight web components , can directly manipulate the dom structure.

# Playground

https://codesandbox.io/s/priceless-wave-d48gtj?file=/index.html

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
import { html, render } from "@izengliang/direct-html";

render(html` <div>Hello world !</div> `, document.body);
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
// lists , provide track id.

// uid(id)

import { html, uid } from "@izengliang/direct-html";

const items = [
  {
    id: "zengliang",
    name: "lion",
  },
  {
    id: "direct",
    name: "@izengliang/direct-html",
  },
];

html`
  <ul>
    ${items.map((item) => html`<li ${uid(item.id)}>Name - ${item.name}</li>`)}
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

### backbonejs model / collection

Similar to `singal`, but more efficient, simple, and intuitive.

when modal/collection update , then render minimum range view.

```js
import { Model } from "backbone";
import { html, watch } from "@izengliang/direct-html";

const styleModel = new Model({ color: "blue", backgroundColor: "yellow" });

const data = new Model({ title: "my title", content: "my content" });

html`
  <article>
    <header style=${styleMap(value)}>${watch(data, "title")}</header>
    <div >
      ${watch(data, "content")}
    </div>
  </article>
`;

```

### class map directive

```js
html` <div class=${{ isBox: true, user: true }}></div> `;
```

### style map directive

```js
html`
  <div style=${{ color: "blue", backgroundColor: "yellow" }}></div>
`;
```

# Plan - **No implements , please waiting**

### re-render mode directive

```js
html` <div ${mode(options)}></div> `;
```






