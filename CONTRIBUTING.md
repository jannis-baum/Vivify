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
