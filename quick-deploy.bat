@echo off
echo 🚀 QUICK DEPLOY MENU
echo.
echo 1. Railway (Easiest - Built-in MySQL)
echo 2. Render (Free - Need external DB)  
echo 3. Vercel (Fastest - Need external DB)
echo.
set /p choice="Choose (1/2/3): "

if "%choice%"=="1" (
    echo 🚂 Deploying to Railway...
    node deploy-railway.js
    echo.
    echo ✅ Done! Go to https://railway.app to complete
) else if "%choice%"=="2" (
    echo 🎨 Deploying to Render...
    node deploy.js
    echo.
    echo ✅ Done! Go to https://render.com to complete
) else if "%choice%"=="3" (
    echo ▲ Deploying to Vercel...
    node deploy-vercel.js
    echo.
    echo ✅ Done! Run 'npx vercel' to deploy
) else (
    echo ❌ Invalid choice
)

pause