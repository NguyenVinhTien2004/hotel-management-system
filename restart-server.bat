@echo off
echo ========================================
echo    KHOI DONG LAI SERVER HOTEL SYSTEM
echo ========================================

echo.
echo 1. Dung server hien tai...
taskkill /f /im node.exe 2>nul
timeout /t 2 >nul

echo.
echo 2. Xoa cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .cache rmdir /s /q .cache

echo.
echo 3. Khoi dong server...
cd backend
start "Hotel Server" cmd /k "echo Server dang chay tren port 3002 && node server.js"

echo.
echo 4. Mo trinh duyet...
timeout /t 3 >nul
start http://localhost:3002/debug.html

echo.
echo ========================================
echo    HOAN THANH!
echo ========================================
echo.
echo - Server: http://localhost:3002
echo - Debug: http://localhost:3002/debug.html
echo - Dashboard: http://localhost:3002/dashboard.html
echo.
echo Nhan phim bat ky de dong...
pause >nul
