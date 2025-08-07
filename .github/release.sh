#!/bin/sh

# ensure main branch
if [ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]; then
    echo "Releases should only be made from branch main" >&2
    exit 1
fi

# ensure arg
if [ "$1" != "patch" -a "$1" != "minor" ]; then
    echo "Specify increment patch|minor." >&2
    exit 1
fi

# base & previous version
version="v0.1.0"
prev=$(git tag --sort=version:refname | tail -1)

# increment
if [[ -n "$prev" ]]; then
    major=$(cut -d. -f1 <<< $prev)
    minor=$(cut -d. -f2 <<< $prev)

    [[ "$1" = "patch" ]] && patch=$(bc <<< "$(cut -d. -f3 <<< $prev) + 1")
    [[ "$1" = "minor" ]] && minor=$(bc <<< "$minor + 1") && patch="0"

    version="$major.$minor.$patch"
fi

git tag -s -a $version
git push origin $version
