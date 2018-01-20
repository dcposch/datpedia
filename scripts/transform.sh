#!/bin/bash
set -e

if [ -d transform/$1 ]; then
  echo "Skipping transform, directory exists: transform/$1"
else
  time ./scripts/transform.js $1
  cd transform/$1
  time zip -r wiki.zip A
  cd ../..
  time ./scripts/list.js $1
fi
