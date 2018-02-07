#!/bin/bash

set -e

DEFAULT_HOST="datpedia.us-east-1.aws"

if [ -z "$1" ]; then
  echo "Usage: ./scripts/deploy-run.sh <wiki dump name> <optional host name>"
  echo "       Deploys, then invokes main.sh <dump name> on the remote host"
  echo "       Host defaults to $DEFAULT_HOST"
fi

if [ -z "$2" ]; then
  HOST="$DEFAULT_HOST"
else
  HOST="$2"
fi

echo 'DEPLOYING'
# ./scripts/deploy.sh $HOST

echo 'RUNNING'
#ssh $HOST "cd /mnt/disk/datpedia && screen -d -m -S deploy-run ./scripts/main.sh $1"
#echo "Command started"

ssh $HOST "cd /mnt/disk/datpedia && ./scripts/main.sh $1"
