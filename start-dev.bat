@echo off
echo Starting PassVault Backend and Frontend...

:: Start Backend in a new terminal window
start "PassVault Backend" cmd /k "cd backend\src && uvicorn app.main:app --reload"

:: Start Frontend in a new terminal window
start "PassVault Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers launched!