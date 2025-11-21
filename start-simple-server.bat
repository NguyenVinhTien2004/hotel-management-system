@echo off
echo ========================================
echo    KHOI DONG SIMPLE SERVER (KHONG CAN MYSQL)
echo ========================================
echo.

echo [1/3] Kiem tra Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js chua duoc cai dat!
    echo 💡 Vui long tai va cai dat Node.js tu: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js da san sang

echo.
echo [2/3] Chuyen den thu muc backend...
cd /d "%~dp0backend"
if not exist "package.json" (
    echo ❌ Khong tim thay package.json trong thu muc backend!
    pause
    exit /b 1
)
echo ✅ Da vao thu muc backend

echo.
echo [3/3] Cai dat dependencies (neu can)...
if not exist "node_modules" (
    echo 🔄 Dang cai dat dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Loi cai dat dependencies!
        pause
        exit /b 1
    )
    echo ✅ Da cai dat dependencies
) else (
    echo ✅ Dependencies da co san
)

echo.
echo ========================================
echo    DANG KHOI DONG SIMPLE SERVER...
echo ========================================
echo 🌐 Server se chay tai: http://localhost:3001
echo 👤 Dang nhap admin: admin / password
echo 🛑 Nhan Ctrl+C de dung server
echo ========================================
echo.

node simple-server.js