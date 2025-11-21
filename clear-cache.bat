@echo off
echo ========================================
echo        CLEAR CACHE - KHACH SAN CAY DUA
echo ========================================
echo.

echo 1. Dang xoa Service Worker cache...
echo.

echo 2. Khoi dong lai server...
cd backend
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul
start "Hotel Server" cmd /k "node server.js"
cd ..

echo.
echo 3. Mo trinh duyet voi cache cleared...
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   HUONG DAN SU DUNG:
echo ========================================
echo 1. Mo Chrome/Edge
echo 2. Nhan F12 (Developer Tools)
echo 3. Chuot phai vao nut Refresh
echo 4. Chon "Empty Cache and Hard Reload"
echo.
echo HOAC nhan Ctrl + Shift + R
echo ========================================
echo.

start http://localhost:3002/index.html

pause
