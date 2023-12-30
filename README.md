# direct-html

Efficient, efficient, and scalable HTML templates in JavaScript.

### Playground

https://codepen.io/liangzeng/pen/BabNOQx

### Install

    npm install @izengliang/direc-html

### CDN

```html
<script src="
https://cdn.jsdelivr.net/npm/@izengliang/direct-html@0.0/src/index.min.js
"></script>
```

### Use

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

# direct-element

direct-element is a simple library used to build fast, lightweight web components that can directly manipulate dom structures.
