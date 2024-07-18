#!/bin/sh

if [ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]; then
    echo "Releases should only be made from branch main"
    exit 1
fi

if [ "$1" != "minor" -a "$1" != "major" ]; then
    echo "Specify increment minor|major."
    exit 1
fi

version="v0.0.1"
prev=$(git tag --sort=version:refname | tail -1)

if [ -n "$prev" ]; then
    prefix=$(cut -d. -f1 <<< $prev)
    major=$(cut -d. -f2 <<< $prev)

    [ "$1" = "minor" ] && minor=$(bc <<< "$(cut -d. -f3 <<< $prev) + 1")
    [ "$1" = "major" ] && major=$(bc <<< "$major + 1") && minor="0"

    version="$prefix.$major.$minor"
fi

git tag -s -a $version
git push origin $version
