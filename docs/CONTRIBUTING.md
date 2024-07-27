# Contributing to Vivify

Contributions are very welcome! If you would like to contribute, please make
sure you follow the steps below:

- Make sure there is an issue corresponding to what you are working on, and name
  your branch`issue/<issue-number>-<hyphenated-name-of-issue>`, e.g.

  ```plain
  issue/134-add-branch-naming-convention
  ```

  for issue #134 "Add branch naming convention"
- Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)
  with `#<issue-number>` as the context for all commits, e.g.

  ```plain
  docs(#134): mention convention in CONTRIBUTING.md
  ```

- Make sure there are no merge commits on your branch
- Open a pull request, include the issue it relates to in the body, e.g. `Closes
  #69`
- Wait for a review!

For more information on how to get started, read on!

## Setting Up Your Build Environment

First install the required build dependencies using your system package manager

- yarn
- make
- zip

Next you need to make sure you have Node.js installed

Node.js may be available with your OS or in your distro package manager.
Alternatively you can install the latest version of Node.js using **[Node
Version Manager](https://github.com/nvm-sh/nvm)** (**nvm**)

> [!NOTE]
> The version of **Node.js** shipped with some Linux distributions will fail to
> build **Vivify**, in that case you should refer to the **nvm** documentation
> to install the latest version

## Running Vivify for Development

First clone and open the **Vivify** repository, then run `yarn` to download
Node.js dependencies

    yarn

**Vivify** has a development mode that will:-

1. Run the server on port `3000` instead of the usual port of `31622`;
2. Automatically reload when you make changes to the code; and
3. Unlike the installed version, not shut down when there are no connected
   clients.

To run the **Vivify** server in development mode:-

    yarn dev

Once the development server is running, you can connect as many instances as you
like:-

    yarn viv .

 Using `yarn viv` will connect to the development server on port 3000  

> [!TIP]
> You can replace `.` with any file or directory

## Installing Vivify

To install **Vivify** for use outside of your development environment, first
define your install location by running the configuration script that takes an
install path as a parameter: `./configure <install-dir>`

For example:-

    ./configure ~/.local/bin

Then run `make install` to build and install **Vivify**

    make install

Once installed you can launch **viv** by calling `viv <some-file-or-directory>`

> [!TIP]  
> Ideally the install location should be included in your $PATH variable

## Troubleshooting

### Build Error: Could not find the sentinel NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

Cause: This happens on some Linux distros when using the distro packaged
versions of Node.js

Resolution: Install the latest version of Node.js using nvm, See the section
above:
[**Setting Up Your Build Environment**](#setting-up-your-build-environment)

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
