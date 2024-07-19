# Contributing to Vivify

Contributions are very welcome! If you would like to contribute, please make
sure you follow the steps below:

- Make sure there is an issue corresponding to what you are working on
- Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)
  with `#<your issue number>` as the context for all commits
- Make sure you are not adding any merge commits to your branch
- Open a pull request & wait for a review!🩵

## Developing environment

After installing all dependencies with `yarn`, you can run

```sh
yarn dev
```

to run the development server for Vivify on port 3000 that will (1)
automatically reload when you make changes to the code, and (2), unlike the
installed version, not shut down when there are no connected clients.

With the development server running, use

```sh
yarn viv
```

instead of your installed Vivify executable. This will (1) connect to the
development server on port 3000 instead of running the installed server, and (2)
use the `viv` executable in the repository.

## Testing rendering

You can find files to test Vivify's rendering/parsing capabilities in the
[`tests/`](tests/) directory. Please make sure to add to this in case you add
anything new related to this.

## Writing Markdown

We use
[markdownlint](https://github.com/DavidAnson/markdownlint?tab=readme-ov-file) in
its default configuration to ensure consistent style across Markdown files. You
can install [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)
to lint your files locally with `yarn lint-markdown` or rely on on your editor,
e.g. with [coc-markdownlint](https://github.com/fannheyward/coc-markdownlint)
for Vim with coc.nvim.
