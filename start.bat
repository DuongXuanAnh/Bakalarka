@echo off
echo ==== Starting My React App ====

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js before proceeding.
    exit /b 1
)

REM Check if dependencies are installed
if not exist node_modules (
    echo Dependencies not found. Running installation first...
    call install.bat
)

REM Start the React application
echo Starting the application on port 3000...
npm start

REM This will not execute until the npm start command is terminated
echo Application stopped. 