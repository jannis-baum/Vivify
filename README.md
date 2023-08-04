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

### Markdown

- heading/anchor links
- GitHub emojis `:smile:`
- full Katex math support
- GitHub task-lists
- syntax highlighting for code

If you need any additional features, feel free to [open an
issue](https://github.com/jannis-baum/vivify/issues/new/choose) or
[contribute](CONTRIBUTING.md)!

## Usage

- download & unpack the latest release for your system (macOS or Linux)
- add the two executables to your `$PATH`
- run `viv <file>` to view `<file>`

## Editor Support

Vivify has a simple API to integrate your favorite editor so the viewer live
updates to any changes as you are typing and the scrolling is smoothly
synchronized!

See below for a list of existing editor plugins. In case your favorite editor is
not yet supported, use these as an example to write your own and add it to the
list!

### Existing integration

- for Vim: [vivify.vim](https://github.com/jannis-baum/vivify.vim)

## Get help

Is something not working or do you have any questions? [Open an
issue](https://github.com/jannis-baum/vivify/issues/new/choose)!

## Acknowledgments

I have been using
[iamcco/markdown-preview.nvim](https://github.com/iamcco/markdown-preview.nvim)
for the longest time and started this project because

1. I wanted a Markdown viewer that works without Vim and
2. I wanted a Markdown viewer that supports file links like in GitHub.

Looking at
[iamcco/markdown-preview.nvim](https://github.com/iamcco/markdown-preview.nvim)
helped in development, particularly with regard to which `npm` packages to use.
