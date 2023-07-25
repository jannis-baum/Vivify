#!/bin/sh

cd `dirname $0`

rm -rf bin

node_modules/.bin/tsc --project . \
    && node_modules/.bin/pkg . \
    || exit 1

mkdir bin/macos
mv bin/vivify-server-macos bin/macos/vivify-server
cp viv bin/macos/viv

mkdir bin/linux
mv bin/vivify-server-linux bin/linux/vivify-server
cp viv bin/linux/viv
