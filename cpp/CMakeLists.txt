cmake_minimum_required(VERSION 3.12)
project(blackscholes_cpp)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find Python - will use Python_EXECUTABLE if provided via -DPython_EXECUTABLE
find_package(Python COMPONENTS Interpreter Development REQUIRED)

message(STATUS "Using Python: ${Python_EXECUTABLE}")
message(STATUS "Python version: ${Python_VERSION}")
message(STATUS "Python include dirs: ${Python_INCLUDE_DIRS}")

# Try to find pybind11
find_package(pybind11 CONFIG)

if(NOT pybind11_FOUND)
    # If not found, try to use Python's pybind11 module
    message(STATUS "pybind11 not found via CMake, trying Python module...")
    execute_process(
        COMMAND ${Python_EXECUTABLE} -m pybind11 --cmakedir
        OUTPUT_VARIABLE pybind11_DIR
        OUTPUT_STRIP_TRAILING_WHITESPACE
        ERROR_QUIET
        RESULT_VARIABLE PYBIND11_RESULT
    )
    
    if(PYBIND11_RESULT EQUAL 0 AND pybind11_DIR)
        message(STATUS "Found pybind11 via Python module: ${pybind11_DIR}")
        find_package(pybind11 CONFIG REQUIRED PATHS ${pybind11_DIR} NO_DEFAULT_PATH)
    else()
        message(FATAL_ERROR 
            "pybind11 not found!\n"
            "Install it in your venv with: pip install pybind11\n"
            "Or specify Python executable: cmake -DPython_EXECUTABLE=/path/to/python .."
        )
    endif()
else()
    message(STATUS "Found pybind11 via CMake: ${pybind11_DIR}")
endif()

# Include directories
include_directories(include)

# Source files
set(SOURCES
    src/BlackScholes.cpp
    src/bindings.cpp
)

# Create Python module
pybind11_add_module(blackscholes_cpp ${SOURCES})

# Installation
install(TARGETS blackscholes_cpp DESTINATION ${CMAKE_SOURCE_DIR}/../backend)
