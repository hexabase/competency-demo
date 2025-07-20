.PHONY: up down build ps logs

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

ps:
	docker-compose ps

logs:
	docker-compose logs -f 