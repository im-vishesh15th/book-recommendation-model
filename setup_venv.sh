#!/bin/bash

# Exit on error
set -e

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

echo "Virtual environment 'venv' created and dependencies installed."
echo "To activate the virtual environment, run: source venv/bin/activate"