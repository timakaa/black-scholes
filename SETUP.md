# Setup Instructions

## Prerequisites

- **C++ compiler**: g++ or clang++ (Xcode Command Line Tools on macOS)
- **CMake**: >= 3.12
- **Python**: 3.8+ with pip
- **Node.js**: 18+
- **npm**: Latest version

## Quick Start (Automated)

```bash
chmod +x build.sh
./build.sh
```

## Manual Installation

### Step 1: Install pybind11

**IMPORTANT**: Install pybind11 first before building C++

```bash
# Using pip (recommended)
pip install pybind11

# Or using Homebrew on macOS
brew install pybind11

# Verify installation
python3 -m pybind11 --includes
```

### Step 2: Build C++ Library

```bash
cd cpp
mkdir -p build && cd build
cmake ..
make
make install
cd ../..
```

**Expected output**: `blackscholes_cpp.cpython-*.so` file in the `backend/` directory

### Step 3: Setup Python Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### Step 4: Setup Next.js Frontend

```bash
cd frontend
npm install
cd ..
```

## Running the Application

### Terminal 1: Start Backend

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend API: http://localhost:8000
API Docs: http://localhost:8000/docs

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

Frontend: http://localhost:3000

## Verification & Testing

### 1. Check Backend Health

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{ "status": "healthy", "cpp_module": "loaded" }
```

### 2. Test C++ Module

```bash
cd backend
source venv/bin/activate
python3 << EOF
import blackscholes_cpp as bs
model = bs.BlackScholes(100, 100, 1.0, 0.05, 0.2)
print(f"Call Price: {model.call_price():.2f}")
print("✓ C++ module working!")
EOF
```

### 3. Test API Endpoint

```bash
curl -X POST http://localhost:8000/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "stock_price": 100,
    "strike_price": 100,
    "time_to_maturity": 1.0,
    "risk_free_rate": 0.05,
    "volatility": 0.2
  }'
```

## Troubleshooting

### CMake can't find pybind11

**Error**: `Could not find a package configuration file provided by "pybind11"`

**Solutions**:

1. Install pybind11 via pip:

   ```bash
   pip install pybind11
   ```

2. On macOS with Homebrew:

   ```bash
   brew install pybind11
   export CMAKE_PREFIX_PATH="/opt/homebrew:$CMAKE_PREFIX_PATH"
   ```

3. Manually set the path:
   ```bash
   export pybind11_DIR=$(python3 -m pybind11 --cmakedir)
   cd cpp/build
   cmake ..
   ```

### Python development headers missing

**Error**: `Python.h: No such file or directory`

**Solutions**:

- **macOS**: `xcode-select --install`
- **Ubuntu/Debian**: `sudo apt-get install python3-dev`
- **Fedora/RHEL**: `sudo dnf install python3-devel`

### C++ module not loading

**Error**: `ModuleNotFoundError: No module named 'blackscholes_cpp'`

**Check**:

```bash
ls backend/blackscholes_cpp*.so
```

If missing, rebuild:

```bash
cd cpp/build
make clean
cmake ..
make
make install
```

### Frontend build issues

**Clear Next.js cache**:

```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Port already in use

**Backend (8000)**:

```bash
lsof -ti:8000 | xargs kill -9
```

**Frontend (3000)**:

```bash
lsof -ti:3000 | xargs kill -9
```

## Development Tips

- Use `--reload` flag with uvicorn for auto-restart on code changes
- Frontend uses Turbopack for faster development builds
- Check API documentation at http://localhost:8000/docs
- Use browser DevTools to debug frontend issues
