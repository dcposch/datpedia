#!/bin/bash
set -e

npm run build

rm -rf build/$1
mkdir -p build/$1
cd build/$1

ln -s ../../static/favicon.ico ./
ln -s ../../static/index.html ./
ln -s ../../static/bundle.js ./
ln -s ../../static/sphere.gif ./
ln -s ../../static/style.css ./

ln -s ../../transform/$1/wiki.zip ./
ln -s ../../transform/$1/list.tsv ./
ln -s ../../transform/$1/list-partial.json ./
