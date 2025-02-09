# How to upgrade dependencies

This document explains how to upgrade dependencies of Vivify. Only relevant for
maintainers.

## Process

1. First commit: Run `yarn upgrade-interactive --latest`, go through the list,
   press <kbd>space</kbd> on all yellow and green entries, and confirm with
   <kbd>enter</kbd>. This should always be fine and not break anything (unless
   developers didn't properly flag some minor breaking change which often
   happens).
2. Check that you can still `make install`, that `yarn lint` and `yarn dev`
   still work as they should, and that auto-refreshing with the Vim plugin
   works. You can use the files in [`tests/rendering`](../tests/rendering) to
   confirm. If something broke, fix the problems with one commit each.
3. Next commit: Run `yarn upgrade-interactive --latest` again and install all
   red (breaking) `devDependencies`.
4. Repeat *step 2*.
5. Run `yarn upgrade-interactive --latest` again and go through the list of red
   (breaking) `dependencies`. Look up what the exact breaking change is and how
   it affects the project. With one commit each, upgrade the dependency and fix
   whatever (if anything) it broke as in *step 2*.
6. Run `yarn deduplicate` and then `yarn` to keep only the newest required
   versions of dependencies and hopefully address all security issues the
   [Dependabot](https://github.com/jannis-baum/Vivify/security/dependabot) had
   found.
7. Repeat *step 2* a final time, open a PR and ask another maintainer for a
   review.

## Reviewing upgrade PRs

You can follow along *step 2* above to check things are working and leave
comments on the PR if they aren't.
