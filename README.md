# Black-Scholes Option Pricing Platform

A full-stack application for pricing European options using the Black-Scholes model.

## Architecture

```
┌─────────────────┐
│   Next.js       │  Frontend - Interactive UI
│   Frontend      │  Port: 3000
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐                        ┌─────────────────┐
│   FastAPI       │  Backend - API Layer   │   Redis         │  Cache Layer
│   Python        │  Port: 8000            │   Cache         │  Port: 6379
└────────┬────────┘                        └─────────────────┘
         │
         │ Python Bindings (pybind11)
         │
┌────────▼────────┐
│   C++           │
│   Library       │
└─────────────────┘
```

## Features

- **High-Performance Calculations**: C++ core for fast Black-Scholes computations
- **Multi-Layer Caching**:
  - Backend: Redis caching (1 hour TTL)
  - Frontend: React Query caching (1 minute stale time, 5 minutes cache time)
- **RESTful API**: Clean FastAPI backend with automatic documentation
- **Interactive UI**: Modern Next.js frontend with real-time calculations

## Quick Start

### Option 1: Docker (Recommended)

```bash
docker-compose pull
docker-compose up -d
```

Visit http://localhost:3000

See [DOCKER.md](docs/DOCKER.md) for more details.

### Option 2: Manual Setup

See [SETUP.md](docs/SETUP.md) for completely manual setup

## Services

When running with Docker Compose:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
