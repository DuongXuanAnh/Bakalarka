#!/bin/bash

echo "==== Installing My React App ===="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js before proceeding."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm before proceeding."
    exit 1
fi

# Display Node.js and npm versions
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# Install dependencies
echo "Installing dependencies..."
npm install

# Set up environment file
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# React App Environment Variables
# Password for admin when want to work with database
REACT_APP_ADMIN_PASSWORD = '123456'
# Name of the collection in the database
REACT_APP_COLECTION_NAME = 'problems'
# Firebase configuration
REACT_APP_API_KEY='AIzaSyDwhybGV01eVHNx5DTKWLSbCe-cYvL5p18'
REACT_APP_AUTH_DOMAIN='bakalarka-8bdbb.firebaseapp.com'
REACT_APP_PROJECT_ID='bakalarka-8bdbb'
REACT_APP_STORAGE_BUCKET='bakalarka-8bdbb.appspot.com'
REACT_APP_MESSAGING_SENDER_ID='607356537300'
REACT_APP_APP_ID='1:607356537300:web:09437815081055284b6e41'
REACT_APP_MEASUREMENT_ID='G-EZK2PS1MTE'
EOF
    echo ".env file created successfully. You may need to edit it with your specific configuration."
else
    echo ".env file already exists. Skipping creation."
fi

echo "==== Installation completed successfully! ===="
echo "To start the application, run: ./start.sh" 