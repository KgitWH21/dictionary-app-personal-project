docker run -d --name dictionary_db -e POSTGRES_PASSWORD=words \
  -e POSTGRES_DB=dictionary_db -p 5432:5432 postgres:16-alpine
