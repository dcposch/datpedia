cd .. && tar -czvf - datpedia | ssh datpedia.us-east-1.aws "cd /mnt/disk && tar -xzvf -"
cd datpedia
echo "done"
