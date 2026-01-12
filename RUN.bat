@echo off
echo ============================================
echo    HACKER'S PLAYGROUND - SETUP SCRIPT
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js is installed
echo.

REM Navigate to backend
cd /d "%~dp0backend"

REM Check if package.json exists
if exist package.json (
    echo ✓ package.json found
) else (
    echo Creating package.json...
    echo { > package.json
    echo   "name": "hackers-playground", >> package.json
    echo   "version": "1.0.0", >> package.json
    echo   "description": "Complete vulnerable web app with all attacks", >> package.json
    echo   "main": "server.js", >> package.json
    echo   "scripts": { >> package.json
    echo     "start": "node server.js" >> package.json
    echo   }, >> package.json
    echo   "dependencies": { >> package.json
    echo     "express": "^4.18.2", >> package.json
    echo     "sqlite3": "^5.1.6" >> package.json
    echo   } >> package.json
    echo } >> package.json
    echo ✓ package.json created
)

echo.
echo Installing dependencies...
call npm install

echo.
echo ============================================
echo    STARTING HACKER'S PLAYGROUND...
echo ============================================
echo.
echo 🌐 Open your browser and go to: http://localhost:3000
echo.
echo ⚠️  This application contains INTENTIONAL vulnerabilities:
echo    1. SQL Injection
echo    2. Cross-Site Scripting (XSS)
echo    3. Broken Authentication
echo    4. Sensitive Data Exposure
echo    5. Security Misconfiguration
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

pause