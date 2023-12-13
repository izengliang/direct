# direct

Direct is a simple library for building fast, lightweight web components , can directly manipulate the dom structure.

# Code example

```jsx
html`
  <article>
    <h1 .title=${title_alt}>${article.title} is core domain</h1>
    <div>
      <h3 style=${subTitleStyle}>${article.subTitle}</h3>
      <ul>
        ${list.map((item) => html`<li @click=${clickItemHandler}>${item}</li>`)}
      </ul>
    </div>
  </article>
`;
```

## API

### html

return `TemplateResult`

Example:

```js
const templateResult = html` <div>hello world</div> `;
```

### render

render `TemplateResult` based on `Element`.

```js
/**
 * @typedef { ( TemplateResult, Node , opt )=>void } render
 * @param { "before" | "after" | "begin" | "end" } opt.position
 */
```

### TemplateResult

Type `{ strings: string[] , values: any[] }`

Obtained by calling **html\`\<div\>${value}<\/div\>\`**

### Template

```js
/**
 * @param {string[]} strings - Obtained by calling html`<div>${value}</div>`.strings
 */
const template = new Template(strings);
```

`Template` can create a `Binder` .

### Binder

It update the view based on `TemplateResult.values`.

#### - new Builder(templateFragment, valueInfos)

- templateFragment is a `DocumentFragment`
- valueInfos `ValueInfo[]`

#### - builder.update(values, { mode })

default 

- values: `TemplateResult.values`
  render and update template nodes.

- mode: update mode
  - `upgrade` change an existing node.
  - `re-structure` Change existing nodes and restore the structure.
  - `re-render` empty old nodes, 

### ValueType

```js
/** @enum {number} */
export const ValueType = {
  attribuite: 0,
  property: 1,
  event: 2,
  directive: 3,
  templateResult: 4,
  node: 5,
};
```

### ValueInfo

```js
/**
 * @typedef ValueInfo
 * @param {number} position
 * @param {Element} host
 * @param {boolean} isChild
 * @param {Comment} markerComment
 * @paran {ValueType} type
 */
```

### Directive

### Position

### Render





### concept






