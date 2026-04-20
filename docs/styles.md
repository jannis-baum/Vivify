# Customizing styling

You can [add custom styles](./customization.md) to Vivify. The styles will be
applied after Vivify's [default styles](../static/) are applied so that there
are always sensible fallbacks but you can override everything.

See below for some additional tips.

## Colors

All of Vivify's default styling uses color variables. The best way to change a
color of something is to change the corresponding color variable and leave all
other styling unmodified. You can check [Vivify's default
colors](../static/colors.css) to see all the variables and how to set them.

## Useful classes

Vivify sets some classes that have no styles by default but may help you while
customizing your own setup.

- `source-line`: All elements that have this class also have an HTML attribute
  `data-source-line` with the corresponding line in the plain text source
  document.
- `has-vim-cursor`: If you use
  [vivify.vim](https://github.com/jannis-baum/vivify.vim), the element
  corresponding to where the cursor is in Vim will have this class. You could
  for example use

  ```css
  .has-vim-cursor {
      border: 1px solid var(--bg-mark);
  }
  ```

  to create a box around that element.
