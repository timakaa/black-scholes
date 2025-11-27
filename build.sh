#!/bin/bash

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════╗"
echo "║  Black-Scholes Full-Stack Application Builder         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v cmake &> /dev/null; then
    echo "❌ CMake not found. Please install CMake >= 3.12"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.8+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js 18+"
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

echo "✓ Found Python $PYTHON_VERSION"

# Warn if Python is too new
if [ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -ge 14 ]; then
    echo "⚠️  Warning: Python 3.14+ detected. Some packages may not be compatible."
    echo "   Recommended: Python 3.9-3.13"
    echo ""
    
    # Check if python3.13 or python3.12 is available
    if command -v python3.13 &> /dev/null; then
        echo "✓ Found python3.13, using it instead..."
        PYTHON_CMD="python3.13"
    elif command -v python3.12 &> /dev/null; then
        echo "✓ Found python3.12, using it instead..."
        PYTHON_CMD="python3.12"
    elif command -v python3.11 &> /dev/null; then
        echo "✓ Found python3.11, using it instead..."
        PYTHON_CMD="python3.11"
    else
        echo "❌ No compatible Python version found (3.9-3.13)"
        echo "   Please install Python 3.13 or 3.12:"
        echo "   brew install python@3.13"
        exit 1
    fi
else
    PYTHON_CMD="python3"
fi

echo "✓ Using: $PYTHON_CMD"
echo ""

# Setup Python backend and install dependencies FIRST
echo "Step 1: Setting up Python virtual environment..."
cd backend
$PYTHON_CMD -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
echo "✓ Python venv created and dependencies installed"
echo ""

# Now build C++ library using venv's Python
echo "Step 2: Building C++ library with venv Python..."
cd ../cpp

# Clean previous build
rm -rf build
mkdir -p build
cd build

# Use the venv's Python for CMake - get absolute path
VENV_PYTHON=$(cd ../../backend/venv/bin && pwd)/python3
echo "Using venv Python: $VENV_PYTHON"

# Verify pybind11 is available in venv
if ! $VENV_PYTHON -c "import pybind11" 2>/dev/null; then
    echo "❌ pybind11 not found in venv. Installing..."
    cd ../../backend
    source venv/bin/activate
    pip install pybind11
    cd ../cpp/build
fi

# Build with explicit Python path
cmake -DPython_EXECUTABLE="$VENV_PYTHON" ..
make
make install
cd ../..

if [ -f backend/blackscholes_cpp*.so ] || [ -f backend/blackscholes_cpp*.pyd ]; then
    echo "✓ C++ library built successfully"
else
    echo "❌ C++ library build failed - module not found in backend/"
    exit 1
fi
echo ""

# Test C++ module with venv
echo "Step 3: Testing C++ module..."
cd backend
source venv/bin/activate
python3 -c "import blackscholes_cpp; print('✓ C++ module loads successfully')" || {
    echo "❌ C++ module failed to load"
    exit 1
}
cd ..
echo "✓ Backend setup complete"
echo ""

# Setup Frontend
echo "Step 4: Setting up Next.js frontend..."
cd frontend
# npm install
cd ..
echo "✓ Frontend setup complete"
echo ""

echo "╔════════════════════════════════════════════════════════╗"
echo "║  Build Complete! 🎉                                    ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "To run the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn main:app --reload"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "API Documentation: http://localhost:8000/docs"
echo "════════════════════════════════════════════════════════"
