tar -czvf - . | ssh datpedia.us-east-1.aws "cd /mnt/disk && tar -xzvf -"
