@echo off
echo ========================================
echo    THAY DOI PORT TU 3001 SANG 3002
echo ========================================
echo.

echo [1/5] Thay doi backend files...
powershell -Command "(Get-Content 'backend\.env') -replace 'PORT=3001', 'PORT=3002' | Set-Content 'backend\.env'"
powershell -Command "(Get-Content 'backend\server.js') -replace '3001', '3002' | Set-Content 'backend\server.js'"
powershell -Command "(Get-Content 'backend\mock-server.js') -replace '3001', '3002' | Set-Content 'backend\mock-server.js'"
powershell -Command "(Get-Content 'backend\server-with-permissions.js') -replace '3001', '3002' | Set-Content 'backend\server-with-permissions.js'"
echo ✅ Backend files updated

echo.
echo [2/5] Thay doi frontend config...
powershell -Command "(Get-Content 'frontend\js\config.js') -replace '3001', '3002' | Set-Content 'frontend\js\config.js'"
echo ✅ Frontend config updated

echo.
echo [3/5] Thay doi admin dashboard...
powershell -Command "(Get-Content 'frontend\admin-dashboard.js') -replace '3001', '3002' | Set-Content 'frontend\admin-dashboard.js'"
echo ✅ Admin dashboard updated

echo.
echo [4/5] Thay doi bat files...
powershell -Command "(Get-Content 'clear-cache.bat') -replace '3001', '3002' | Set-Content 'clear-cache.bat'"
powershell -Command "(Get-Content 'restart-server.bat') -replace '3001', '3002' | Set-Content 'restart-server.bat'"
powershell -Command "(Get-Content 'start-server.bat') -replace '3001', '3002' | Set-Content 'start-server.bat'"
powershell -Command "(Get-Content 'start-simple-server.bat') -replace '3001', '3002' | Set-Content 'start-simple-server.bat'"
echo ✅ Batch files updated

echo.
echo [5/5] Thay doi deploy files...
powershell -Command "(Get-Content 'deploy.js') -replace '3001', '3002' | Set-Content 'deploy.js'"
echo ✅ Deploy files updated

echo.
echo ========================================
echo    HOAN THANH! TAT CA PORT DA DOI SANG 3002
echo ========================================
echo 🌐 Server moi se chay tai: http://localhost:3002
echo 💡 Hay chay start-simple-server.bat de khoi dong
pause