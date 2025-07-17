@echo off
setlocal enabledelayedexpansion

REM ============================================================================
REM Firebase Emulator Suite Launcher for Windows
REM ============================================================================

title Firebase Emulator Suite

REM Set console color scheme for better visibility
color 0F

REM Clear screen for clean output
cls

echo.
echo ============================================================================
echo                    Firebase Emulator Suite Launcher
echo ============================================================================
echo.

REM ============================================================================
REM 1. Check Prerequisites
REM ============================================================================

echo [INFO] Checking prerequisites...
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    goto :error_exit
)

REM Get Node.js version
for /f "tokens=*" %%v in ('node --version 2^>nul') do set NODE_VERSION=%%v
echo [OK] Node.js found: %NODE_VERSION%

REM Check if Firebase CLI is installed
where firebase >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Firebase CLI is not installed.
    echo Please install Firebase CLI: npm install -g firebase-tools
    echo.
    goto :error_exit
)

REM Get Firebase CLI version
for /f "tokens=*" %%v in ('firebase --version 2^>nul') do set FIREBASE_VERSION=%%v
echo [OK] Firebase CLI found: %FIREBASE_VERSION%

REM Check if Java is installed (required for some emulators)
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Java is not installed or not in PATH.
    echo Some emulators (Firestore, Database) may not work without Java.
    echo Please install Java JDK 11 or later from https://adoptium.net/
    echo.
    set JAVA_WARNING=true
) else (
    REM Get Java version
    for /f "tokens=3" %%v in ('java -version 2^>^&1 ^| findstr "version"') do set JAVA_VERSION=%%v
    echo [OK] Java found: !JAVA_VERSION!
)

echo.

REM Check if firebase.json exists in current directory
if not exist "firebase.json" (
    echo [ERROR] firebase.json not found in current directory.
    echo Please run this script from your Firebase project root.
    echo Or initialize a new Firebase project with: firebase init
    echo.
    goto :error_exit
)

echo [OK] Firebase project configuration found.
echo.

REM ============================================================================
REM 2. Set Environment Variables
REM ============================================================================

echo [INFO] Configuring environment variables...
echo.

REM Set default ports (can be overridden by firebase.json)
set FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
set FIREBASE_FIRESTORE_EMULATOR_HOST=localhost:8080
set FIREBASE_DATABASE_EMULATOR_HOST=localhost:9000
set FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001
set FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
set FIREBASE_PUBSUB_EMULATOR_HOST=localhost:8085
set FIREBASE_EVENTARC_EMULATOR_HOST=localhost:9299

REM Set UI host and port
set FIREBASE_EMULATOR_UI_HOST=localhost:4000

REM Increase memory for Node.js to handle multiple emulators
set NODE_OPTIONS=--max-old-space-size=4096

REM Set timezone to avoid date/time issues
set TZ=UTC

echo [OK] Environment variables configured.
echo.

REM ============================================================================
REM 3. Check Available Disk Space
REM ============================================================================

echo [INFO] Checking disk space...
for /f "tokens=3" %%a in ('dir %CD% ^| find "bytes free"') do set SPACE=%%a
echo [OK] Available disk space: %SPACE% bytes
echo.

REM ============================================================================
REM 4. Start Firebase Emulators
REM ============================================================================

echo [INFO] Starting Firebase Emulator Suite...
echo.
echo Emulator UI will be available at: http://localhost:4000
echo.

REM Check if emulators are already running on default ports
netstat -an | find "LISTENING" | find ":4000" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Port 4000 is already in use. Another emulator instance may be running.
    echo Do you want to continue anyway? (Y/N)
    set /p CONTINUE=
    if /i "!CONTINUE!" NEQ "Y" (
        echo [INFO] Operation cancelled by user.
        goto :normal_exit
    )
)

echo [INFO] Launching emulators in a new window...
echo.

REM Create a command to run emulators
set EMULATOR_CMD=firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data

REM Start emulators in a new command window
start "Firebase Emulators" cmd /k "echo Starting Firebase Emulators... & echo. & %EMULATOR_CMD%"

REM ============================================================================
REM 5. Wait for Emulators to Start
REM ============================================================================

echo [INFO] Waiting for emulators to start...
echo.

REM Wait for UI to become available (max 30 seconds)
set RETRY_COUNT=0
:wait_loop
if %RETRY_COUNT% GEQ 30 (
    echo [ERROR] Emulators failed to start within 30 seconds.
    echo Please check the emulator window for error messages.
    echo.
    goto :error_exit
)

REM Check if emulator UI is responding
curl -s http://localhost:4000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    goto :emulators_ready
)

REM If curl is not available, try alternative check
if %ERRORLEVEL% NEQ 0 (
    netstat -an | find "LISTENING" | find ":4000" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        goto :emulators_ready
    )
)

echo Waiting... (%RETRY_COUNT%/30 seconds)
timeout /t 1 /nobreak >nul
set /a RETRY_COUNT+=1
goto :wait_loop

:emulators_ready
echo [OK] Emulators are ready!
echo.

REM ============================================================================
REM 6. Open Browser
REM ============================================================================

echo [INFO] Opening Firebase Emulator UI in your default browser...
echo.

REM Open browser with emulator UI
start http://localhost:4000

REM ============================================================================
REM 7. Provide User Instructions
REM ============================================================================

echo ============================================================================
echo                           EMULATORS READY!
echo ============================================================================
echo.
echo Firebase Emulator Suite is now running with the following services:
echo.
echo   • Emulator UI:        http://localhost:4000
echo   • Authentication:     http://localhost:9099
echo   • Firestore:          http://localhost:8080
echo   • Realtime Database:  http://localhost:9000
echo   • Functions:          http://localhost:5001
echo   • Storage:            http://localhost:9199
echo   • Pub/Sub:            http://localhost:8085
echo   • Eventarc:           http://localhost:9299
echo.

if defined JAVA_WARNING (
    echo [WARNING] Java was not detected. Some emulators may not function properly.
    echo.
)

echo ============================================================================
echo                              NEXT STEPS
echo ============================================================================
echo.
echo 1. Use the Emulator UI at http://localhost:4000 to manage your app
echo 2. Configure your app to use the emulators:
echo.
echo    For Web (JavaScript):
echo    import { connectFirestoreEmulator } from 'firebase/firestore';
echo    import { connectAuthEmulator } from 'firebase/auth';
echo    
echo    connectFirestoreEmulator(db, 'localhost', 8080);
echo    connectAuthEmulator(auth, 'http://localhost:9099');
echo.
echo 3. Test data will be imported from ./emulator-data (if exists)
echo 4. Data will be exported to ./emulator-data when you stop emulators
echo.
echo ============================================================================
echo                              TROUBLESHOOTING
echo ============================================================================
echo.
echo Common Issues:
echo   • Port conflicts: Change ports in firebase.json
echo   • Java errors: Install Java JDK 11+ from https://adoptium.net/
echo   • Permission errors: Run as Administrator
echo   • Firewall: Allow Node.js and Java through Windows Firewall
echo.
echo To stop emulators:
echo   • Close the Firebase Emulators window, or
echo   • Press Ctrl+C in the emulator window
echo.

REM ============================================================================
REM 8. Keep Console Open
REM ============================================================================

goto :normal_exit

:error_exit
echo ============================================================================
echo                                ERROR
echo ============================================================================
echo.
echo The Firebase Emulator setup encountered an error.
echo Please check the error messages above and try again.
echo.
echo Common solutions:
echo   1. Install Node.js: https://nodejs.org/
echo   2. Install Firebase CLI: npm install -g firebase-tools
echo   3. Install Java JDK: https://adoptium.net/
echo   4. Run from Firebase project directory
echo   5. Check Windows Firewall settings
echo.
pause
exit /b 1

:normal_exit
echo Press any key to close this window...
echo (The emulators will continue running in the background)
echo.
pause >nul
exit /b 0