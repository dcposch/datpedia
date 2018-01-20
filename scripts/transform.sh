#!/bin/bash
set -e

if [ -d transform/$1 ]; then
  echo "Skipping transform, directory exists: transform/$1"
else
  time ./scripts/transform.js $1
  cd transform/$1
  zip -r wiki.zip A
fi
