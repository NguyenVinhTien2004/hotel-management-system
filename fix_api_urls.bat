@echo off
echo Fixing API URLs in frontend files...

REM Replace localhost:3000 with localhost:3001 in all HTML and JS files
powershell -Command "(Get-Content 'frontend\admin-dashboard.js') -replace 'localhost:3000', 'localhost:3001' | Set-Content 'frontend\admin-dashboard.js'"
powershell -Command "(Get-Content 'frontend\admin-login.html') -replace 'localhost:3000', 'localhost:3001' | Set-Content 'frontend\admin-login.html'"
powershell -Command "(Get-Content 'frontend\booking-history.html') -replace 'localhost:3000', 'localhost:3001' | Set-Content 'frontend\booking-history.html'"
powershell -Command "(Get-Content 'frontend\bookings.html') -replace 'localhost:3000', 'localhost:3001' | Set-Content 'frontend\bookings.html'"
powershell -Command "(Get-Content 'frontend\customer-services.html') -replace 'localhost:3000', 'localhost:3001' | Set-Content 'frontend\customer-services.html'"
powershell -Command "(Get-Content 'frontend\customers.html') -replace 'localhost:3000', 'localhost:3001' | Set-Content 'frontend\customers.html'"
powershell -Command "(Get-Content 'frontend\feedback.html') -replace 'localhost:3000', 'localhost:3001' | Set-Content 'frontend\feedback.html'"
powershell -Command "(Get-Content 'frontend\profile.html') -replace 'localhost:3000', 'localhost:3001' | Set-Content 'frontend\profile.html'"
powershell -Command "(Get-Content 'frontend\register.html') -replace 'localhost:3000', 'localhost:3001' | Set-Content 'frontend\register.html'"
powershell -Command "(Get-Content 'frontend\room-detail.html') -replace 'localhost:3000', 'localhost:3001' | Set-Content 'frontend\room-detail.html'"
powershell -Command "(Get-Content 'frontend\room-list.html') -replace 'localhost:3000', 'localhost:3001' | Set-Content 'frontend\room-list.html'"
powershell -Command "(Get-Content 'frontend\rooms.html') -replace 'localhost:3000', 'localhost:3001' | Set-Content 'frontend\rooms.html'"
powershell -Command "(Get-Content 'frontend\services.html') -replace 'localhost:3000', 'localhost:3001' | Set-Content 'frontend\services.html'"

echo Done! All API URLs have been updated to use port 3001.
pause