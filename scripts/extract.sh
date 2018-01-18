#!/bin/bash
set -e

if [ -d extract/$1 ]; then
  echo "Skipping extract, directory exists: extract/$1"
else
  time ./node_modules/.bin/zimmer extract download/$1.zim extract/$1/A
  mkdir -p extract/$1/I
  mv extract/$1/A/m extract/$1/I
  mv extract/$1/A/s extract/$1/I
fi
