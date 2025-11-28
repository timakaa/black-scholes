.PHONY: help build push pull up down clean

# Load environment variables
include .env.docker
export

help:
	@echo "Black-Scholes Docker Commands"
	@echo ""
	@echo "Development (build from source):"
	@echo "  make build          - Build images locally"
	@echo "  make up-build       - Build and start containers"
	@echo "  make down           - Stop containers"
	@echo ""
	@echo "Production (use Docker Hub):"
	@echo "  make push           - Build and push images to Docker Hub"
	@echo "  make pull           - Pull images from Docker Hub"
	@echo "  make up             - Start containers from Docker Hub images"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean          - Remove containers, images, and volumes"
	@echo ""
	@echo "Configuration:"
	@echo "  Edit .env.docker to set DOCKER_USERNAME and IMAGE_TAG"

build:
	@echo "Building images locally..."
	docker compose build

push: build
	@echo "Pushing images to Docker Hub..."
	docker compose push

pull:
	@echo "Pulling images from Docker Hub..."
	docker compose pull

up:
	@echo "Starting containers from Docker Hub images..."
	docker compose up -d

up-build:
	@echo "Building and starting containers..."
	docker compose up --build -d

down:
	@echo "Stopping containers..."
	docker compose down

clean:
	@echo "Cleaning up containers, images, and volumes..."
	docker compose down -v --rmi local
	@echo "Cleanup complete!"
