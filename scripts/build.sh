#!/bin/bash
set -e

npm run build

mkdir -p build/$1
cp -r \
  static/favicon.ico \
  static/index.html \
  static/bundle.js \
  static/sphere.gif \
  static/style.css \
  build/$1/

cd build/$1
rm -f wiki.zip list-full.json list-partial.json
ln -s ../../transform/$1/wiki.zip ./
ln -s ../../transform/$1/list-full.json ./
ln -s ../../transform/$1/list-partial.json ./
