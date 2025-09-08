# Customizing Vivify

Vivify offers various configuration options. It aims to have sensible defaults
while being built for maximal customizability.

## Configuration file

Vivify will look for an optional config file at

- `~/.config/vivify/config.json`,
- `~/.config/vivify.json`,
- `~/.vivify/config.json`, and
- `~/.vivify.json`.

This file should contain a JSON object that can have the following optional
keys:

- **`"styles"`**\
  A path to a single custom style sheet, or an array of paths for multiple style
  sheets applied in order. The paths can be absolute, start with a tilde (`~`)
  for your home directory, or be relative to your config file's directory. The
  paths can also include [glob patterns](https://www.npmjs.com/package/glob).\
  The styles will be applied after Vivify's [default styles](../static/) are
  applied so that there are always sensible fallbacks but you can override
  everything.
- **`"scripts"`**\
  A path to a single custom JavaScript to inject into the viewing pages, or an
  array of paths for multiple custom scripts injected in order. The paths can be
  absolute, start with a tilde (`~`) for your home directory, or be relative to
  your config file's directory. The paths can also include [glob
  patterns](https://www.npmjs.com/package/glob).
- **`"dirListIgnore"`**\
  A path to a file with globs to ignore in Vivify's directory viewer, or an
  array of multiple paths to ignore files. The syntax here is the same as in
  `.gitignore` files.
- **`"timeout"`**\
  How long the server should wait in milliseconds before shutting down after the
  last client disconnected (default is 10000)
- **`"pageTitle"`**\
  JavaScript code that will be evaluated to determine the viewer's page title.
  Here, the variable `components` is set to a string array of path components
  for the current file, e.g. `['~', 'some', 'path', 'file.txt']`. If this
  evaluation fails, the title will be *custom title error* and you will see the
  error message on the page. The default title are the last two components
  joined with the path separator, e.g.  `path/file.txt`
- **`"mdExtensions"`**\
  An array of file extensions that Vivify will render as Markdown. All other
  files (except for Jupyter Notebooks) will be displayed as monospaced text with
  code highlighting if available. The default Markdown extensions are
  `['markdown', 'md', 'mdown', 'mdwn', 'mkd', 'mkdn']`
- **`"preferHomeTilde"`**\
  Prefer using `~` as a placeholder for your home directory in URLs as well as
  the `components` for `"pageTitle"` (default is `true`)
- **`"katexOptions"`**\
  [Available KaTeX options](https://katex.org/docs/options.html), such as

  ```json
  "katexOptions": {
    "errorColor": "#cc0000",
    "macros": {
      "\\RR": "\\mathbb{R}"
    }
  }
  ```

- **`"tocOptions"`**\
  [Available options for the table of
  contents](https://www.npmjs.com/package/markdown-it-table-of-contents?activeTab=readme#options),
  such as

  ```json
  "tocOptions": {
    "includeLevel": [2, 3]
  }
  ```

- **`"alertOptions"`**\
  Options to customize
  [alerts](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)
  beyond the 5 default ones used by GitHub. You may also know this feature by
  the name of [Obsidian callouts](https://help.obsidian.md/callouts).

  ```json
  "alertOptions": {
    "icons": {
      "foo": "zap",
      "bar": "./icons/flower.svg"
    "titles": {
      "bar": "Tip of the day"
    },
    "fallbackIcon": "alert"
  }
  ```

  For alerts customization, see [full explanation with examples](alerts.md).

### Reloading config

Vivify reads the config on startup, i.e. when you want it to reload the config,
you have to restart Vivify. You can do this for example by running

```sh
pkill -f vivify-server
```

Note that refreshing an open Vivify tab won't work at this point since the
server will no longer be running. You can just run `viv` to open it again.

## Environment variables

In addition to these config file entries, the following options can be set
through environment variables.

- **`VIV_PORT`**\
  The port Vivify's server should run on (default is 31622)
- **`VIV_TIMEOUT`**\
  Same as `"timeout"` from config file above but takes precedence over the
  setting in the config file
