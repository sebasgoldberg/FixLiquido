echo 'Executar assim que conectar: cd && cd deps/0/node/bin/ && PS_LINE=$( ps aux | grep node | grep -v "sh -c node" | grep -v "grep" | grep -v nodemon ) && NODE_PID=$( echo $PS_LINE | cut -f2 -d" " ) && ./node inspect -p $NODE_PID'
cf ssh $1 -L 9229:localhost:9229