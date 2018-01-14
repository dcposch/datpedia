#!/bin/bash
set -e

echo "WIKIMEDIA TO DAT"
./scripts/download.sh $1
./scripts/extract.sh $1
./scripts/organize.sh $1
./scripts/share.sh $1
