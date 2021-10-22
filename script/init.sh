#!/bin/bash

# Script à titre d'exemple pour les futurs requête vers le serveur de gestion des docker

curl --unix-socket /var/run/docker.sock -H "Content-Type: application/json" \
                                      -d '{"Name": "test", "Driver": "local"}' \
                                      -X POST http://localhost/v1.40/volumes/create

parse_name=algoflex/parse:0.4
compile_name=algoflex/compile:0.4
execute_name=algoflex/execute:0.4

docker build -t $parse_name ./parse

docker build -t $compile_name ./compile

docker build -t $execute_name ./execute

parse=$(curl --unix-socket /var/run/docker.sock -H "Content-Type: application/json" \
  -d '{"Image": "'$parse_name'", "HostConfig":{"Binds":["test:/volume/test"]}, "Cmd": ["python", "parserEasy.py", "{\"ID\": \"45\", \"code\": \"#include <stdio.h> \\n int main() { printf(\\\"Hello World !\\\"); return 0;}\"}"]}' \
  -X POST http://localhost/v1.40/containers/create | jq ".Id" -r)

compile=$(curl --unix-socket /var/run/docker.sock -H "Content-Type: application/json" \
  -d '{"Image": "'$compile_name'", "HostConfig":{"Binds":["test:/volume/test"]}}' \
  -X POST http://localhost/v1.40/containers/create | jq ".Id" -r)

run=$(curl --unix-socket /var/run/docker.sock -H "Content-Type: application/json" \
  -d '{"Image": "'$execute_name'", "HostConfig":{"Binds":["test:/volume/test"]}}' \
  -X POST http://localhost/v1.40/containers/create | jq ".Id" -r)

curl --unix-socket /var/run/docker.sock -H "Content-Type: application/json" \
  -X POST http://localhost/v1.40/containers/$parse/start &&

curl --unix-socket /var/run/docker.sock -H "Content-Type: application/json" \
  -X POST http://localhost/v1.40/containers/$compile/start &&

curl --unix-socket /var/run/docker.sock -H "Content-Type: application/json" \
  -X GET http://localhost/v1.40/containers/$compile/logs?stderr=true --output ./output_compile.log &&

curl --unix-socket /var/run/docker.sock -H "Content-Type: application/json" \
  -X POST http://localhost/v1.40/containers/$run/start &&
  
curl --unix-socket /var/run/docker.sock -H "Content-Type: application/json" \
  -X GET http://localhost/v1.40/containers/$run/logs?stdout=true --output ./output_run.log &&

curl --unix-socket /var/run/docker.sock -H "Content-Type: application/json" \
  -X DELETE http://localhost/v1.40/containers/$parse &&

curl --unix-socket /var/run/docker.sock -H "Content-Type: application/json" \
  -X DELETE http://localhost/v1.40/containers/$compile &&

curl --unix-socket /var/run/docker.sock -H "Content-Type: application/json" \
  -X DELETE http://localhost/v1.40/containers/$run &&

curl --unix-socket /var/run/docker.sock -H "Content-Type: application/json" \
  -X DELETE http://localhost/v1.40/volumes/test
