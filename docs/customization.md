# Customizing Vivify

Vivify offers various configuration options. It aims to have sensible defaults
while being built for maximal customizability.

Vivify will look for an optional config file at `~/.vivify/config.json` and
`~/.vivify.json`. This file should contain a JSON object that can have the
following optional keys:

- **`"styles"`**\
  A path to a single custom style sheet, or an array of multiple style sheets
  applied in order. These will be applied after Vivify's [default
  styles](./static/) are applied so that there are always sensible fallbacks but
  you can override everything.
- **`"scripts"`**\
  A path to a single custom JavaScript to inject into the viewing pages, or an
  array of multiple custom scripts.
- **`"dirListIgnore"`**\
  A path to a file with globs to ignore in Vivify's directory viewer, or an
  array of multiple paths to ignore files. The syntax here is the same as in
  `.gitignore` files.
- **`"port"`**\
  The port Vivify's server should run on; this will be overwritten by
  the environment variable `VIV_PORT` (default is 31622)
- **`"timeout"`**\
  How long the server should wait in milliseconds before shutting down after the
  last client disconnected; this will be overwritten by the environment variable
  `VIV_TIMEOUT` (default is 10000)
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
  {
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
  {
    "includeLevel": [2, 3]
  }
  ```
