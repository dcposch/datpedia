tar -czvf - www | ssh dcpos.ch "cd datpedia && tar -xzvf -"
echo "done"
