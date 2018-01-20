cd .. && tar -czvf - \
  --exclude='datpedia/node_modules' \
  --exclude='datpedia/download' \
  --exclude='datpedia/extract' \
  --exclude='datpedia/transform' \
  --exclude='datpedia/list' \
  --exclude='datpedia/build' \
  datpedia | ssh datpedia.us-east-1.aws "cd /mnt/disk && tar -xzvf -"
cd datpedia
echo "done"
