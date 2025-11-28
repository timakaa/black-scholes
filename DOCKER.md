# Docker Deployment Guide

## Quick Start

### Option 1: Build and Run Locally (Development)

Build images from source code and run:

```bash
docker-compose up --build
```

Or using Make:

```bash
make up-build
```

### Option 2: Use Pre-built Images from Docker Hub (Production)

Pull and run pre-built images:

```bash
docker-compose pull
docker-compose up
```

Or using Make:

```bash
make pull
make up
```

## Configuration

Edit `.env.docker` to set your Docker Hub username:

```bash
DOCKER_USERNAME=yourusername
IMAGE_TAG=latest
```

## Publishing Images to Docker Hub

1. **Login to Docker Hub:**

```bash
docker login
```

2. **Update `.env.docker` with your username:**

```bash
DOCKER_USERNAME=your-dockerhub-username
IMAGE_TAG=v1.0.0  # or latest
```

3. **Build and push images:**

```bash
make push
```

Or manually:

```bash
docker-compose build
docker-compose push
```

## Available Commands

### Using Make (Recommended)

```bash
make help           # Show all available commands
make build          # Build images locally
make up-build       # Build and start containers
make up             # Start containers from Docker Hub
make down           # Stop containers
make push           # Build and push to Docker Hub
make pull           # Pull from Docker Hub
make clean          # Remove everything
```

### Using Docker Compose Directly

```bash
# Build from source
docker-compose build

# Start with local build
docker-compose up --build

# Start from Docker Hub images
docker-compose pull
docker-compose up

# Stop
docker-compose down

# Push to Docker Hub
docker-compose push
```

## Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

## Image Tags

The docker-compose.yml uses environment variables for flexible image naming:

- `DOCKER_USERNAME` - Your Docker Hub username (default: yourusername)
- `IMAGE_TAG` - Image version tag (default: latest)

Images will be named:

- `${DOCKER_USERNAME}/black-scholes-backend:${IMAGE_TAG}`
- `${DOCKER_USERNAME}/black-scholes-frontend:${IMAGE_TAG}`

## Troubleshooting

### C++ Module Build Issues

If the backend fails to load the C++ module, check the logs:

```bash
docker-compose logs backend
```

The entrypoint script automatically builds the C++ module on startup.

### Port Conflicts

If ports 3000 or 8000 are already in use, edit `docker-compose.yml`:

```yaml
ports:
  - "3001:3000" # Change host port
```

### Clean Rebuild

To force a complete rebuild:

```bash
make clean
make build
```
