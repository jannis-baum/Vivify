# Customizing Vivify

Vivify offers various configuration options. It aims to have sensible defaults
while being built for maximal customizability.

Vivify will look for an optional config file at `~/.vivify/config.json` and
`~/.vivify.json`. This file should contain a JSON object that can have the
following optional keys:

- **`"styles"`**\
  a path to a custom style sheet, see [the default
  styles](./static/) for examples
- **`"port"`**\
  the port Vivify's server should run on; this will be overwritten by
  the environment variable `VIV_PORT` (default is 31622)
- **`"timeout"`**\
  how long the server should wait in ms before shutting down after
  the last client disconnected; this will be overwritten by the environment
  variable `VIV_TIMEOUT` (default is 10000)
- **`"katexOptions"`**\
  [available KaTeX options](https://katex.org/docs/options.html), such as

  ```json
  {
    "errorColor": "#cc0000",
    "macros": {
      "\\RR": "\\mathbb{R}"
    }
  }
  ```

- **`"pageTitle"`**\
  JavaScript code that will be evaluated to determine the viewer's page title.
  Here, the variable `components` is set to a string array of path components
  for the current file, e.g. `['/', 'Users', 'you', 'file.txt']`. If this
  evaluation fails, the title will be *custom title error* and you will see the
  error message on the page. The default title are the last two components
  joined with the path separator, e.g.  `you/file.txt`
- **`"mdExtensions"`**\
  An array of file extensions that Vivify will parse as Markdown. All other
  files will be displayed as monospaced text with code highlighting if
  available. Default Markdown extensions are `['markdown', 'md', 'mdown',
  'mdwn', 'mkd', 'mkdn']`
- **`"preferHomeTilde"`**\
  Prefer using `~` as a placeholder for your home directory in URLs as well as
  the `compoments` for `"pageTitle"` (default is `true`)
