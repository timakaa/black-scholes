# Setup Instructions

## Quick Start (Automated)

```bash
chmod +x build.sh
./build.sh
```

This will:

1. Create a Python virtual environment in `backend/venv`
2. Install all Python dependencies (including pybind11) in the venv
3. Build the C++ library using the venv's Python
4. Install frontend dependencies

**No global installation required!** Everything is isolated in the project.

## Manual Installation

### Step 1: Setup Python Backend & Install Dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..
```

This installs pybind11 and all other dependencies in the local venv.

### Step 2: Build C++ Library (using venv Python)

```bash
cd cpp
mkdir -p build && cd build

# Point CMake to the venv's Python
cmake -DPython_EXECUTABLE=../../backend/venv/bin/python3 ..
make
make install
cd ../..
```

**Expected output**: `blackscholes_cpp.cpython-*.so` file in the `backend/` directory

### Step 3: Setup Next.js Frontend

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

**Solution**: Make sure you're using the venv's Python and pybind11 is installed in it:

```bash
# Activate venv
cd backend
source venv/bin/activate

# Install pybind11 in venv
pip install pybind11

# Verify it's installed
python3 -m pybind11 --includes

# Build with venv Python
cd ../cpp/build
cmake -DPython_EXECUTABLE=../../backend/venv/bin/python3 ..
make
make install
```

**Alternative**: If you want to use system Python:

```bash
# Install globally
pip3 install pybind11

# Or on macOS with Homebrew
brew install pybind11
```

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
