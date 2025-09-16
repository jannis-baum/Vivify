# Front Matter

You can add [YAML Front Matter](https://jekyllrb.com/docs/front-matter/) to
your documents. This will be shown by the viewer as a collapsible code block by
default and you can also access the data using [custom
client-side](./customization.md) JavaScript, e.g. like this:

```js
const frontMatterElement = document.getElementById('front-matter');

if (frontMatterElement) {
    try {
        const frontMatter = JSON.parse(frontMatterElement.textContent);
        console.log('Front Matter:', frontMatter);
    } catch (err) {
        console.error('Failed to parse front matter JSON:', err);
    }
}
```

This allows you to do whatever we want with it and customize Vivify to your
individual usage of front matter.

In case you want to avoid the collapsible code block, you can add

```css
#front-matter-section {
    display: none;
}
```

to your [custom styles](./customization.md).
