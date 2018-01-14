#!/bin/bash
set -e

time wget https://dumps.wikimedia.org/other/kiwix/zim/wikipedia/$1.zim -O download/$1.zim
