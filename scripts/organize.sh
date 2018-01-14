#!/bin/sh
set -e

time ./scripts/organize.js ./extract/$1 ./organize/$1
cp -r ./static/* ./organize/$1

