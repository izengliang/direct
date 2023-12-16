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

# Plan

**No impolements**  please waiting ...

```js
// bind class and style  

const isBox = true;
const myColor = "green";

html`<article class.isBox=${isBox} style.backgroundColor=${myColor}>
  direct is directly operate DOM !
</article>`;
```
 