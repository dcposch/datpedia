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

echo "SUBSETTING..."
./scripts/subset.js $1 ./most-viewed/list.txt

echo "BUILDING THE WEB APP..."
npm run build
cp ./most-viewed/list.txt ./subset/
cp -r ./static/* ./subset/

# echo "ORGANIZING..."
# ./scripts/organize.sh $1

echo "DONE"
echo "To update Datpedia, run:"
echo "mkdir output && rm -rf output/* && cp -r organize/* output/ && dat share -d output/$1 --watch=false"
