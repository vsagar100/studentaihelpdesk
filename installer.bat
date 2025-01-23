@echo off

REM ==============================
REM Project Setup Script
REM ==============================

REM Variables
set NODE_INSTALLER_URL=https://nodejs.org/download/release/v16.20.2/node-v16.20.2-x64.msi
set PYTHON_INSTALLER_URL=https://www.python.org/ftp/python/3.12.6/python-3.12.6.exe
set PROJECTS_DIR=C:\Projects
set FLASH_DRIVE= C:\Users\azureuser\Documents\studentaihelpdesk
set BACKEND_DIR=%PROJECTS_DIR%\backend
set FRONTEND_DIR=%PROJECTS_DIR%\frontend
set DB_DIR=%PROJECTS_DIR%\db

echo ===========================
echo Setting Up Environment
echo ===========================

REM Step 1: Check and Install Node.js
echo Checking for Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Downloading installer...
    powershell -Command "Start-BitsTransfer '%NODE_INSTALLER_URL%' 'nodejs_installer.msi'"
    echo Installing Node.js...
    msiexec /i nodejs_installer.msi /quiet
    echo Node.js installed successfully.
) else (
    echo Node.js is already installed.
)

REM Step 2: Check and Install Python
echo Checking for Python...
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed. Downloading installer...
    powershell -Command "Start-BitsTransfer '%PYTHON_INSTALLER_URL%' 'python_installer.exe'"
    echo Installing Python...
    python_installer.exe /quiet InstallAllUsers=1 PrependPath=1 Include_pip=1
    echo Python installed successfully.
) else (
    echo Python is already installed.
)

REM Step 3: Create Projects Directory
echo Creating project folders...
mkdir "%PROJECTS_DIR%\backend" "%PROJECTS_DIR%\frontend" "%PROJECTS_DIR%\db" 2>nul

REM Step 4: Copy Files from Flash Drive
echo Copying files from flash drive...
xcopy "%FLASH_DRIVE%\backend" "%BACKEND_DIR%" /E /H /C /I
xcopy "%FLASH_DRIVE%\frontend" "%FRONTEND_DIR%" /E /H /C /I
xcopy "%FLASH_DRIVE%\db" "%DB_DIR%" /E /H /C /I
echo Files copied successfully.

REM Step 5: Install Backend Dependencies
echo Installing Python packages...
cd "%BACKEND_DIR%"
pip install -r requirements.txt

REM Step 6: Install Frontend Dependencies
echo Installing Node.js packages...
cd "%FRONTEND_DIR%"
call npm install || echo "npm install failed" && exit /b
cd ..

REM Step 7: Initialize Database
echo Initializing SQLite database...
cd "%BACKEND_DIR%"
flask db upgrade

REM Step 8: Start Servers
echo Starting backend server...
start cmd /k "cd /d %BACKEND_DIR% && python app.py"

echo Starting frontend server...
start cmd /k "cd /d %FRONTEND_DIR% && npm start"

echo ===========================
echo Setup Complete!
echo ===========================

pause
