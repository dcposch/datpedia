#!/bin/bash
set -e

time ./scripts/bin/extract_zim_$MACHTYPE -o extract/$1 download/$1.zim
