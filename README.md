# Vivify

Vivify brings your (Markdown) files to life in the browser!

## Features

- various [Markdown features](#markdown)
- links to other files: [relative links like in
  GitHub](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#relative-links)
  as well as absolute file links
- view non-markdown files with code syntax highlighting
- view & navigate directories, hidden "back to parent directory" button at the
  top-left of the file viewer
- easy to integrate with any editor for live synchronization (see [editor
  support](#editor-support))
- Vivify server starts lazily and automatically shuts down when no more viewers
  are connected
- various [config options](#config)
  
If you need any additional features, feel free to [open an
issue](https://github.com/jannis-baum/vivify/issues/new/choose) or
[contribute](CONTRIBUTING.md)!

### Markdown

- heading/anchor links
- [Katex math](https://katex.org)
- [GitHub-style
  task-lists](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#task-lists)
- [GitHub-style emojis like
  `:smile:`](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#using-emojis)
- syntax highlighting for code
- [graphviz/dot graphs](https://graphviz.org/doc/info/lang.html)
- [Pandoc-style definition/description
  lists](https://pandoc.org/MANUAL.html#extension-definition_lists)

### Editor Support

Vivify has a simple API to integrate your favorite editor so the viewer live
updates to any changes as you are typing and the scrolling is smoothly
synchronized!

See below for a list of existing editor plugins. In case your favorite editor is
not yet supported, use these as an example to write your own and add it to the
list!

#### Existing integration

- for Vim and Neovim: [vivify.vim](https://github.com/jannis-baum/vivify.vim)

### Config

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
- **`"openCmd"`**\
  the command `viv` uses to open your browser at a given URL; this
  will be overwritten by the environment variable `VIV_OPEN` (default will try
  `open` and fall back to `xdg-open`)
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

## Installation

Once you have Vivify installed, use it by running `viv` with any text file or
directory as an argument! See below for installation options.

### Packaged

- [AUR](https://aur.archlinux.org/packages/vivify), e.g. install with `yay -S vivify`

### Manual

- make sure you have [`jq`](https://github.com/jqlang/jq) installed
- download & unpack the [latest
  release](https://github.com/jannis-baum/vivify/releases) for your system
  (macOS or Linux)
- add the two executables to your `$PATH`

### Compile yourself

- make sure you have [`jq`](https://github.com/jqlang/jq),
  [`yarn`](https://yarnpkg.com), `make` and `tar` installed
- clone the repository
- run `yarn`
- run `./configure <install_dir>`
- run `make install`

## Get help

Is something not working or do you have any questions? [Open an
issue](https://github.com/jannis-baum/vivify/issues/new/choose)!

## Acknowledgments

I have been using
[iamcco/markdown-preview.nvim](https://github.com/iamcco/markdown-preview.nvim)
for the longest time and started this project because

1. I wanted a Markdown viewer that works with and without Vim and
2. I wanted a Markdown viewer that supports file links like in GitHub.

Looking at
[iamcco/markdown-preview.nvim](https://github.com/iamcco/markdown-preview.nvim)
helped in development, particularly with regard to which `npm` packages to use.
