#!/bin/bash

echo "==== Starting My React App ===="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js before proceeding."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Dependencies not found. Running installation first..."
    ./install.sh
fi

# Start the React application
echo "Starting the application on port 3000..."
npm start

# This will not execute until the npm start command is terminated
echo "Application stopped." 