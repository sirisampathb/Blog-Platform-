@echo off
echo ========================================
echo   Inkwell Blog Platform
echo ========================================
echo.

echo [1/2] Starting Backend API (Port 5000)...
start cmd /k "cd backend && node server.js"

timeout /t 2 /nobreak > nul

echo [2/2] Starting Frontend (Port 3000)...
start cmd /k "cd frontend && npm start"

echo.
echo ✅ Both servers starting...
echo.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo   Admin:    admin@blog.com / admin123
echo.
pause
