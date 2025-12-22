@echo off
cls
title CareerLens APP

echo ========================================
echo         Starting CareerLens APP
echo ========================================
echo.

set "BASE=%~dp0app"

echo Checking folders...
if exist "%BASE%\uploads" (
    echo   [OK] uploads
) else (
    echo   [MISS] uploads
)
if exist "%BASE%\uploads\successor" (
    echo   [OK] uploads\successor
) else (
    echo   [MISS] uploads\successor
)
if exist "%BASE%\data" (
    echo   [OK] data
) else (
    echo   [MISS] data
)
if exist "%BASE%\public" (
    echo   [OK] public
) else (
    echo   [MISS] public
)
if exist "%BASE%\routes" (
    echo   [OK] routes
) else (
    echo   [MISS] routes
)
if exist "%BASE%\node_modules" (
    echo   [OK] node_modules
) else (
    echo   [MISS] node_modules
)

echo.
echo Checking files...
if exist "%BASE%\app.js" echo   [OK] app.js
if exist "%BASE%\node.exe" echo   [OK] node.exe
if exist "%BASE%\data\database.sqlite" echo   [OK] database.sqlite
if exist "%BASE%\uploads\Picture1.png" echo   [OK] Picture1.png
echo.

echo Opening browser...
start "" "http://localhost:3000"

echo Starting server...
echo.

"%BASE%\node.exe" "%BASE%\app.js"

echo.
echo Server closed.
pause
exit
