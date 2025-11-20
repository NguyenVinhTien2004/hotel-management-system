@echo off
echo 🔧 FIX MYSQL PASSWORD
echo.
echo Choose option:
echo 1. I know my MySQL password
echo 2. Reset MySQL password (no password)
echo 3. Install dependencies
echo.
set /p choice="Choose (1/2/3): "

if "%choice%"=="1" (
    set /p password="Enter MySQL password: "
    echo DB_PASSWORD=%password% > .env.temp
    type .env | findstr /v "DB_PASSWORD" >> .env.temp
    move .env.temp .env
    echo ✅ Password updated in .env
) else if "%choice%"=="2" (
    echo 🔄 Resetting MySQL password...
    echo ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY ''; > reset.sql
    echo FLUSH PRIVILEGES; >> reset.sql
    mysql -u root -p < reset.sql
    del reset.sql
    echo ✅ MySQL password reset to empty
) else if "%choice%"=="3" (
    echo 📦 Installing dependencies...
    npm install
    echo ✅ Dependencies installed
)

echo.
echo 🚀 Now run: npm start
pause