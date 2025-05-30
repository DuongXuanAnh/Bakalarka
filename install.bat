@echo off
echo ==== Installing My React App ====

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js before proceeding.
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo npm is not installed. Please install npm before proceeding.
    exit /b 1
)

REM Display Node.js and npm versions
echo Node.js version:
node -v
echo npm version:
npm -v

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
        echo REACT_APP_API_KEY=AIzaSyDwhybGV01eVHNx5DTKWLSbCe-cYvL5p18
        echo REACT_APP_AUTH_DOMAIN=bakalarka-8bdbb.firebaseapp.com
        echo REACT_APP_PROJECT_ID=bakalarka-8bdbb
        echo REACT_APP_STORAGE_BUCKET=bakalarka-8bdbb.appspot.com
        echo REACT_APP_MESSAGING_SENDER_ID=607356537300
        echo REACT_APP_APP_ID=1:607356537300:web:09437815081055284b6e41
        echo REACT_APP_MEASUREMENT_ID=G-EZK2PS1MTE
    ) > .env
    echo .env file created successfully. You may need to edit it with your specific configuration.
) else (
    echo .env file already exists. Skipping creation.
)

echo ==== Installation completed successfully! ====
echo To start the application, run: start.bat 