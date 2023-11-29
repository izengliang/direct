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
