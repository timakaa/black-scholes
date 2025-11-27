cmake_minimum_required(VERSION 3.12)
project(blackscholes_cpp)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find Python
find_package(Python COMPONENTS Interpreter Development REQUIRED)

# Try to find pybind11
find_package(pybind11 CONFIG)

if(NOT pybind11_FOUND)
    # If not found, try to use Python's pybind11
    message(STATUS "pybind11 not found via CMake, trying Python module...")
    execute_process(
        COMMAND ${Python_EXECUTABLE} -m pybind11 --cmakedir
        OUTPUT_VARIABLE pybind11_DIR
        OUTPUT_STRIP_TRAILING_WHITESPACE
        ERROR_QUIET
    )
    
    if(pybind11_DIR)
        message(STATUS "Found pybind11 via Python: ${pybind11_DIR}")
        find_package(pybind11 CONFIG REQUIRED PATHS ${pybind11_DIR})
    else()
        message(FATAL_ERROR "pybind11 not found. Install it with: pip install pybind11")
    endif()
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
