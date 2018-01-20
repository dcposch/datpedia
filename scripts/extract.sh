#!/bin/bash
set -e

if [ -d extract/$1 ]; then
  echo "Skipping extract, directory exists: extract/$1"
else
  time ./scripts/bin/extract_zim_$MACHTYPE -o extract/$1 download/$1.zim
fi
