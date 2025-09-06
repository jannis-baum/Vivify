# Alerts usage and customization

There are five default alerts, that are styled without configuration. These are the
[GitHub
alerts](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts):

```md
> [!NOTE]
> Lorem ipsum
```

```md
> [!TIP]
> Lorem ipsum
```

```md
> [!IMPORTANT]
> Lorem ipsum
```

```md
> [!WARNING]
> Lorem ipsum
```

```md
> [!CAUTION]
> Lorem ipsum
```

## Custom marker

We have extended support similar to [how alerts work in
Obsidian](https://help.obsidian.md/callouts) (where they are called "callouts").
The marker can be a custom multi-word string, like this:

```md
> [!CUSTOM MARKER]
> Lorem ipsum
```

By default, the above alert (with an arbitrary marker) is styled like `[!NOTE]`.
This matches Obsidian's default behavior. If you want to style this separately,
see [customizing fallback alert](#customizing-fallback-alert).

## Custom title

Alert title can optionally be set with the following extended syntax:

```md
> [!NOTE] A custom title
> Lorem ipsum
```

Additionally, custom titles for markers can be set in the configuration:

```json
{
  "alertOptions": {
    "titles": {
      "note": "A custom title"
    }
  }
}
```

With the above example, `[!NOTE]` would *always* be rendered with the title *A
custom title*.

## Case sensitivity

Marker names are matched case-insensitively, meaning `[!CUSTOM MARKER]`,
`[!custom marker]` and `[!Custom Marker]` refer to the same type of alert.

In the same way, all keys in `alertOptions.icons` and `alertOptions.titles` are
case-insensitive.

## Configuring alert icons

Set custom icons for alerts by marker type like this:

```json
{
  "alertOptions": {
    "icons": {
      "custom": "bell"
    }
  }
}
```

When set as a string, the icon is interpreted to be a valid
[octicon](https://primer.style/octicons/) name.

This would set the octicon [`bell`](https://primer.style/octicons/icon/bell-16/)
for alert
`[!CUSTOM]`.

### Advanced icon configuration

To use icons other than octicons, the value can be set as a path to an svg
file, for example:

Absolute path:

- `"custom": "/home/user/.config/vivify/icons/flower.svg"`

Home as tilde:

- `"custom": "~/.config/vivify/icons/flower.svg"`

Path relative to Vivify config directory:

- `"custom": "./icons/flower.svg"`

Even a raw svg string can be set in the configuration:

- `"custom": "<svg> ... </svg>"`

## Customizing alert colors

Colors should be customized in your custom stylesheet (via the `"styles"` option
in the [config](customization.md)).

To set any color to a custom alert type:

```css
.alert-custom { --color: #00ff00; }
```

The left-side border, title icon, and title text will be colored as `--color`.

The CSS class is fully lowercased and in `kebab-case`. So for a marker with a
multi-word name, this is how you'd set the color:

```css
.alert-my-multi-word-name { --color: #00ff00; }
```

Instead of coming up with a new hex color, you may want to match to one of the
default alerts' colors. Use one of these CSS variables:

- `--alert-note`
- `--alert-tip`
- `--alert-important`
- `--alert-warning`
- `--alert-caution`

For example:

```css
.alert-custom { --color: var(--alert-important); }
```

## Examples

Here are a few practical examples to achieve some types of alerts that have
default styles in Obsidian, but not on GitHub:

- `[!TODO]`
- `[!QUESTION]`
- `[!EXAMPLE]`
- `[!SUCCESS]`
- `[!FAILURE]`

```json
{
  "alertOptions": {
    "icons": {
      "todo": "check-circle",
      "question": "question",
      "example": "list-unordered",
      "success": "check",
      "failure": "x"
    }
  }
}
```

```css
.alert-todo     { --color: var(--alert-note); }
.alert-question { --color: var(--alert-warning); }
.alert-example  { --color: var(--alert-important); }
.alert-success  { --color: var(--alert-tip); }
.alert-failure  { --color: var(--alert-caution); }
```

## Customizing fallback alert

Any custom alert that hasn't been configured will have the same icon and color
as `[!NOTE]`. If you want a whole separate color and icon for unconfigured
alerts, use these options:

```json
{
  "alertOptions": {
    "fallbackIcon": "alert"
  }
}
```

> [!NOTE]
> `"fallbackIcon"` is a separate option outside of the `"icons"` table, but
> accepts the same type of icon value as the [icon
> customization](#configuring-alert-icons).

For the color, any alert that doesn't have a "known" marker gets a CSS class as
`.fallback-alert`. So, to customize the color:

```css
.fallback-alert { --color: #ff0000; }
```
