#!/bin/bash
set -e

if [ -f download/$1.zim ]; then
  echo "Skipping download, file exists: download/$1.zim"
else
  time wget https://dumps.wikimedia.org/other/kiwix/zim/wikipedia/$1.zim -O download/$1.zim
fi
