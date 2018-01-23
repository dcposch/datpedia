#!/bin/bash

set -e

declare -a arr=("?" "0" "1" "2" "3" "4" "5" "6" "7" "8" "9" \
  "A" "B" "C" "D" "E" "F" "G" "H" "I" "J" "K" "L" "M" "N" "O" "P" "Q" "R" "S" \
  "T" "U" "V" "W" "X" "Y" "Z")

for i in "${arr[@]}"; do
  echo "TRANSFORMING $i"
  ./scripts/transform.js $1 "$i"
  cd transform/$1 && zip -r wiki.zip A/ && rm -rf A && cd -
done

echo "LISTING"
./scripts/list.js $1

echo "DONE"
