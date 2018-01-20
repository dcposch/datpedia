#!/bin/bash
set -e

if [ -d build/$1 ]; then
  echo "Skipping build, directory exists: build/$1"
else
  npm run build
  mkdir -p build/$1
  cp -r static/* build/$1/
  cd build/$1
  rm wiki.zip
  ln -s ../../transform/$1/wiki.zip ./
  ln -s ../../transform/$1/list-full.json ./
  ln -s ../../transform/$1/list-partial.json ./
fi
