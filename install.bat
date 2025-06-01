@echo off
echo ==== Installing My React App ====

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js before proceeding.
    exit /b 1
)

REM Display Node.js and npm versions
echo Node.js version:
node -v

REM Install dependencies
echo Installing dependencies...
call npm install

REM Set up environment file
if not exist .env (
    echo Creating .env file...
    (
        echo # React App Environment Variables
        echo # Password for admin when want to work with database
        echo REACT_APP_ADMIN_PASSWORD=123456
        echo # Name of the collection in the database
        echo REACT_APP_COLECTION_NAME=problems
        echo.
        echo # Firebase configuration
        echo REACT_APP_API_KEY=AIzaSyDljkqx3EewmYAMTThpKunY99y-EtsSDfI
        echo REACT_APP_AUTH_DOMAIN=testdatabase-8216f.firebaseapp.com
        echo REACT_APP_PROJECT_ID=testdatabase-8216f
        echo REACT_APP_STORAGE_BUCKET=testdatabase-8216f.firebasestorage.app
        echo REACT_APP_MESSAGING_SENDER_ID=813596756604
        echo REACT_APP_APP_ID=1:813596756604:web:7d07700479db64f8b917f9
        echo REACT_APP_MEASUREMENT_ID=G-PZHE6VKZLY
    ) > .env
    echo .env file created successfully. You may need to edit it with your specific configuration.
) else (
    echo .env file already exists. Skipping creation.
)

echo ==== Installation completed successfully! ====
echo To start the application, run: start.bat 