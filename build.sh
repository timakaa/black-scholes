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

echo "✓ All prerequisites found"
echo ""

# Install pybind11
echo "Step 1: Installing pybind11..."
pip install pybind11 || pip3 install pybind11
echo "✓ pybind11 installed"
echo ""

# Build C++ library
echo "Step 2: Building C++ library..."
cd cpp
mkdir -p build
cd build
cmake ..
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

# Setup Python backend
echo "Step 3: Setting up Python backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Test C++ module
echo "Testing C++ module..."
python3 -c "import blackscholes_cpp; print('✓ C++ module loads successfully')" || {
    echo "❌ C++ module failed to load"
    exit 1
}
cd ..
echo "✓ Python backend setup complete"
echo ""

# Setup Frontend
echo "Step 4: Setting up Next.js frontend..."
cd frontend
npm install
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
