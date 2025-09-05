# Making PDFs with Vivify

You can leverage Vivify's rendering capabilities and your browser to create
nice PDFs from Markdown. To do this, simply **use your browser's printing
function and save the resulting PDF**.

Note that many browsers will add some headers and footers by default, which you
will probably want to turn off in the printing options to get a clean PDF.

## Customization

You can customize how the PDF will look further by using [custom
styles](./customization.md). One particularly useful function you may not know
about are the `break-before`/`break-after` CSS properties with the `page`
value. These are invisible in HTML, but control where page breaks are inserted.
You could, e.g. add

```css
h2 {
    break-before: page;
}
```

to your custom style sheet to **automatically break the page before each `h2` heading**.

Another useful feature are `print` media queries. You can use these to add
styling that will only be applied to the PDFs but not to the HTML. Vivify uses
this by default to hide the top navigation button you can click to go to the
parent directory, since it obviously doesn't make sense to show it for the PDF:

```css
@media print {
    #top-nav {
        display: none;
    }
}
```

As a nice side note, media queries are also how the PDF will automatically be
created in light mode (at least in most modern browsers), even though you might
generally use dark mode. When printing, your browser automatically sets the
media property `prefers-color-scheme: light` since it's more suitable for
printing and Vivify adjusts the colors accordingly.
