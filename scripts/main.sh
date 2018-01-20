#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage:   ./scripts/main.sh <name>"
  echo "         Where <name> comes from https://dumps.wikimedia.org/other/kiwix/zim/wikipedia/"
  echo
  echo "Example: ./scripts/main.sh wikipedia_en_ray_charles_2015-06"
  echo
  exit
fi

echo "WIKIMEDIA TO DAT"
mkdir -p download extract organize

echo "DOWNLOADING..."
./scripts/download.sh $1

echo "EXTRACTING..."
./scripts/extract.sh $1

echo "TRANSFORMING..."
./scripts/transform.sh $1

echo "BUILDING THE WEB APP..."
./scripts/build.sh $1

echo "DONE"
echo "To update Datpedia, run:"
echo "dat share -d build/$1 --watch=false"
