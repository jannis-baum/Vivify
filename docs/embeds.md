# Embeds and wiki-links

Vivify supports [Obsidian-style](https://help.obsidian.md/) wiki-links and
embeds in addition to standard Markdown links.

## Wiki-links

With the syntax `[[page]]` you link to another file. If the link target has no
file extension, a `.md` extension is assumed, matching Obsidian's behaviour:

```md
See [[other-note]], or [[other-note.md]] if you want an explicit extension.
```

To use custom link text, append a pipe and the desired text:

```md
[[other-note.md|My Other Note]]
[[other-note|My Other Note]]
```

The left side is used for the link `href` (with `.md` appended when no
extension is present), and the right side is shown as the link's text.

## Embeds

Prefixing a wiki-link with `!` turns it into an inline **embed** instead of a
link:

```md
![[image.jpg]]
```

The path is resolved relative to the document you are viewing, just like regular
relative links and images. Which HTML element is generated depends on the file
type, detected from the file extension:

- **Images** (`jpg`, `jpeg`, `png`, `gif`, `webp`, `svg`, `bmp`, `ico`, `avif`)
  are embedded with an `<img>` element, just like a standard
  `![](image.jpg)` reference.
- **PDFs** (`pdf`) are embedded in an `<iframe>` rendered by the browser's
  built-in PDF viewer.
- **Videos** (`mp4`, `webm`, `ogv`, `mkv`, `mov`) are embedded with a
  `<video controls>` player.
- **Audio** (`mp3`, `wav`, `ogg`, `m4a`, `aac`, `flac`) is embedded with an
  `<audio controls>` player.
- **Any other file type** is also embedded in an `<iframe>`, so `![[note.md]]`
  displays the rendered note inline.

If the embed target has no file extension, a `.md` extension is appended
before looking up the file, so `![[note]]` is equivalent to
`![[note.md]]`.

## Resizing embeds

Append a pipe and a size after the path to control the dimensions of an embed.
A width in pixels is supported, optionally combined with a height
(`width x height`):

```md
![[image.jpg|300]]        <!-- 300 pixels wide -->
![[image.jpg|300x200]]    <!-- 300 x 200 pixels -->
```

The same `|size` syntax works for videos, audio and iframes. An unparseable
value (for example `![[image.jpg|large]]`) is ignored and the embed uses its
default size.

## Styling embeds

Embeds use the following CSS classes, which you can override in your [custom
styles](customization.md):

- `.wiki-embed` — base class for all non-image embeds
- `.wiki-embed-pdf` — PDFs
- `.wiki-embed-iframe` — fallback iframes for other file types
- `.wiki-embed-video` — `<video>` players
- `.wiki-embed-audio` — `<audio>` players

For example, to render PDFs at a different default height:

```css
.wiki-embed-pdf {
    height: 800px;
}
```
