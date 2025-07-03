#!/usr/bin/env python

"""
Test script to verify the virtual environment setup.
This script checks if all required packages are installed correctly.
"""

import sys
import importlib


def check_package(package_name):
    """Check if a package is installed and print its version."""
    try:
        package = importlib.import_module(package_name)
        version = getattr(package, '__version__', 'unknown')
        print(f"✅ {package_name} is installed (version: {version})")
        return True
    except ImportError:
        print(f"❌ {package_name} is NOT installed")
        return False


def main():
    """Main function to check all required packages."""
    print(f"Python version: {sys.version}\n")
    
    required_packages = [
        'fastapi',
        'uvicorn',
        'numpy',
        'matplotlib',
        'seaborn',
        'pandas',
        'sklearn',
    ]
    
    print("Checking required packages...\n")
    
    all_installed = True
    for package in required_packages:
        if not check_package(package):
            all_installed = False
    
    print("\nSummary:")
    if all_installed:
        print("✅ All required packages are installed.")
        print("✅ Environment is ready for the Book Recommendation Engine.")
    else:
        print("❌ Some packages are missing. Please install them using:")
        print("   pip install -r requirements.txt")


if __name__ == "__main__":
    main()