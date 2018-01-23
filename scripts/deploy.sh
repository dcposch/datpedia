
HOST="$1"

if [ -z "$HOST" ]; then
  HOST="datpedia.us-east-1.aws"
fi

echo "Deploying to $HOST"

cd .. && tar -czvf - \
  --exclude='datpedia/node_modules' \
  --exclude='datpedia/download' \
  --exclude='datpedia/extract' \
  --exclude='datpedia/transform' \
  --exclude='datpedia/list' \
  --exclude='datpedia/build' \
  --exclude='datpedia/.git' \
  --exclude='datpedia/static/wiki.zip' \
  --exclude='datpedia/static/list-full.json' \
  --exclude='datpedia/static/list-partial.json' \
  datpedia | ssh $HOST "cd /mnt/disk && tar -xzvf -"
cd datpedia
echo "done"
