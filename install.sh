#!/bin/bash

echo "==== Installing My React App ===="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js before proceeding."
    exit 1
fi

# Display Node.js and npm versions
echo "Node.js version: $(node -v)"

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
REACT_APP_API_KEY='AIzaSyDljkqx3EewmYAMTThpKunY99y-EtsSDfI'
REACT_APP_AUTH_DOMAIN='testdatabase-8216f.firebaseapp.com'
REACT_APP_PROJECT_ID='testdatabase-8216f'
REACT_APP_STORAGE_BUCKET='testdatabase-8216f.firebasestorage.app'
REACT_APP_MESSAGING_SENDER_ID='813596756604'
REACT_APP_APP_ID='1:813596756604:web:7d07700479db64f8b917f9'
REACT_APP_MEASUREMENT_ID='G-PZHE6VKZLY'
EOF
    echo ".env file created successfully. You may need to edit it with your specific configuration."
else
    echo ".env file already exists. Skipping creation."
fi

echo "==== Installation completed successfully! ===="
echo "To start the application, run: ./start.sh" 