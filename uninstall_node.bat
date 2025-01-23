@echo off
setlocal enabledelayedexpansion

:: Check admin privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Please run as Administrator
    pause
    exit /b 1
)

:: Stop any running Node processes
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM npm.exe /T 2>nul

:: Remove Node.js installation
if exist "C:\Program Files\nodejs" (
    echo Removing Node.js...
    rmdir /S /Q "C:\Program Files\nodejs"
)
if exist "C:\Program Files (x86)\nodejs" (
    rmdir /S /Q "C:\Program Files (x86)\nodejs"
)

:: Remove npm cache
echo Cleaning npm cache...
if exist "%APPDATA%\npm" (
    rmdir /S /Q "%APPDATA%\npm"
)
if exist "%APPDATA%\npm-cache" (
    rmdir /S /Q "%APPDATA%\npm-cache"
)

:: Remove global packages
echo Removing global packages...
if exist "%USERPROFILE%\AppData\Roaming\npm" (
    rmdir /S /Q "%USERPROFILE%\AppData\Roaming\npm"
)

:: Remove node_modules from user directory
echo Removing node_modules...
if exist "%USERPROFILE%\node_modules" (
    rmdir /S /Q "%USERPROFILE%\node_modules"
)

:: Clean environment variables
echo Cleaning environment variables...
reg delete "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Environment\NODE_PATH" /f 2>nul
reg delete "HKEY_CURRENT_USER\Environment\NODE_PATH" /f 2>nul

:: Remove from Program Files
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall" /s | find /i "node.js" > temp.txt
for /f "tokens=*" %%a in (temp.txt) do (
    reg delete "%%a" /f 2>nul
)
del temp.txt

echo Node.js has been uninstalled. Please restart your computer.
pause