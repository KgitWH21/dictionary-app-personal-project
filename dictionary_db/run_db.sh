#!/bin/bash

docker build -t dictionary_db-img .

docker run -d \
    --name dictionary_db-container \
    --hostname dictionary-db-container \
    --network dictionary-network \
    -p 5433:5432 \
    -v dictionary_db-data:/var/lib/postgresql/data \
    dictionary_db-img

