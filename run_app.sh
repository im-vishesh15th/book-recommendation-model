#!/bin/bash

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Creating one..."
    ./setup_venv.sh
fi

# Activate virtual environment
source venv/bin/activate

# Run the FastAPI application
echo "Starting Book Recommendation API..."
uvicorn main:app --reload