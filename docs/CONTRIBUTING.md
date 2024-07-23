# Contributing to Vivify

Contributions are very welcome! If you would like to contribute, please make
sure you follow the steps below:

- Make sure there is an issue corresponding to what you are working on
- Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)
  with `#<your issue number>` as the context for all commits
- Make sure you are not adding any merge commits to your branch
- Open a pull request, include the issue it relates to in the body, for example:
  `Closes #69`
- Wait for a review! 🩵

For more information on how to get started, read on!

## Setting Up Your Build Environment

To build **Vivify** you need the following dependencies:-

**MacOS:**

    TODO: Mac instructions

**Arch Linux/Manjaro:**

    sudo pacman -S --needed yarn make zip

**Fedora and derivatives:**

    sudo dnf install yarn make zip

> [!NOTE]
> The version of **Node.js** shipped with some Linux distributions will fail to
> build **Vivify**, see the section below to install the latest node from **nvm**

## Installing Node.js

Node.js may be available with your OS or in your distros package manager.
Alternatively you can install the latest version of Node.js using **[Node
Version Manager](https://github.com/nvm-sh/nvm)** (**nvm**)

To install **nvm** use:-

    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

You will then need to reload your terminal by either closing it and opening a
new one or by re-sourcing your run commands (bash eg: `source ~/.bashrc`)

Now you can install the latest version of Node.js:-

    nvm install node

> [!TIP]
> You can return to the system version of node using `nvm use system`
>
> For more details on nvm usage or for troubleshooting installing nvm, visit the
> nvm [Documentation][1] page
>
> [1]:<https://github.com/nvm-sh/nvm?tab=readme-ov-file#node-version-manager--->

## Building Vivify

First clone and open the **Vivify** repository

    git clone https://github.com/jannis-baum/Vivify.git
    cd Vivify

Run `yarn` to download all node dependencies

    yarn

Then build **Vivify** by running `make <OS-family>` where *OS-family* is your
operating system (Linux or MacOS)

**MacOS:**

    make macos

**Linux:**

    make linux

If you want to install **Vivify** for use outside of your development
environmentm you can use `make install` but first you need to run the
`configure <install-dir>` script, eg:-

    ./configure ~/.local/bin
    make install

Once installed you can launch **viv** by calling `viv <some-path-or-file>`

> [!TIP]  
> Ideally the install location should be included in your $PATH variable

## Running Vivify for Development

Once you have built **Vivify** or installed it using the pre-built binaries, you
can then run the **Vivify** server in development mode to try it out with
live-updates as you are coding.

Using `yarn dev` to run **Vivify** in dev mode will:-

1. Run `vivify-server` on port `3000` instead of the usual port of `31622` so
   they can be run side by side;
2. Automatically reload when you make changes to the code; and
3. Unlike the installed version, not shut down when there are no connected
   clients.

First, use `yarn` to make sure all node dependencies are up to date

    yarn

Then start the **Vivify** server in dev mode

    yarn dev

Once the development server is running, you can connect as many instances as you
like using:-

    yarn viv .

> [!TIP]
> Using `yarn viv` will connect to the development server on port 3000 instead
> of running the installed server, and will use the viv executable in the
> repository
>
> You can replace `.` with any path or filename

## Troubleshooting

### Build Error: Could not find the sentinel NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

Cause: This happens on some Linux distros when using the distro packaged
versions of Node.js

Resolution: Install the latest version of Node.js using nvm, See the
**Installing Node.js** section above

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
