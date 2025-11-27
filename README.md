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
┌────────▼────────┐
│   FastAPI       │  Backend - API Layer
│   Python        │  Port: 8000
└────────┬────────┘
         │
         │ Python Bindings (pybind11)
         │
┌────────▼────────┐
│   C++           │  Core - Black-Scholes Logic
│   Library       │  Compiled to .so/.dll
└─────────────────┘
```

## Project Structure

```
black-scholes/
├── cpp/                    # C++ core library
│   ├── src/
│   ├── include/
│   └── CMakeLists.txt
├── backend/                # Python FastAPI
│   ├── app/
│   ├── requirements.txt
│   └── main.py
├── frontend/               # Next.js application
│   ├── app/
│   ├── components/
│   └── package.json
└── README.md
```

## Quick Start

### 1. Build C++ Library

```bash
cd cpp
mkdir build && cd build
cmake ..
make
```

### 2. Start Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

## Features

- Real-time option pricing calculations
- Interactive parameter adjustments
- Greeks visualization (Delta, Gamma, Vega, Theta, Rho)
- Probability distributions
- Profit/Loss diagrams
- Historical volatility analysis
