.PHONY: install run client server

install:
	npm install

run:
	npm run dev

client:
	npm run dev:client

server:
	npm run dev:server
