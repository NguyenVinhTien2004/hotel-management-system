@echo off
echo Fixing API URLs for mobile access...

REM Sửa các file HTML còn lại
powershell -Command "(Get-Content 'frontend\booking-history.html') -replace \"const API_URL = 'http://localhost:3001/api';\", \"const API_URL = AppConfig.getApiUrl();\" | Set-Content 'frontend\booking-history.html'"

powershell -Command "(Get-Content 'frontend\profile.html') -replace \"const API_URL = 'http://localhost:3001/api';\", \"const API_URL = AppConfig.getApiUrl();\" | Set-Content 'frontend\profile.html'"

powershell -Command "(Get-Content 'frontend\register.html') -replace \"const API_URL = 'http://localhost:3001/api';\", \"const API_URL = AppConfig.getApiUrl();\" | Set-Content 'frontend\register.html'"

powershell -Command "(Get-Content 'frontend\room-detail.html') -replace \"const API_URL = 'http://localhost:3001/api';\", \"const API_URL = AppConfig.getApiUrl();\" | Set-Content 'frontend\room-detail.html'"

powershell -Command "(Get-Content 'frontend\service-detail.html') -replace \"const API_URL = 'http://localhost:3001/api';\", \"const API_URL = AppConfig.getApiUrl();\" | Set-Content 'frontend\service-detail.html'"

powershell -Command "(Get-Content 'frontend\service-rating.html') -replace \"const API_URL = 'http://localhost:3001/api';\", \"const API_URL = AppConfig.getApiUrl();\" | Set-Content 'frontend\service-rating.html'"

powershell -Command "(Get-Content 'frontend\services.html') -replace \"const API_URL = 'http://localhost:3001/api';\", \"const API_URL = AppConfig.getApiUrl();\" | Set-Content 'frontend\services.html'"

REM Thêm import config.js vào các file chưa có
echo Adding config.js imports...

REM Thêm vào booking-history.html
powershell -Command "(Get-Content 'frontend\booking-history.html') -replace \"    <script>\", \"    <script src=\"\"js/config.js\"\"></script>`n    <script>\" | Set-Content 'frontend\booking-history.html'"

REM Thêm vào profile.html  
powershell -Command "(Get-Content 'frontend\profile.html') -replace \"    <script>\", \"    <script src=\"\"js/config.js\"\"></script>`n    <script>\" | Set-Content 'frontend\profile.html'"

REM Thêm vào register.html
powershell -Command "(Get-Content 'frontend\register.html') -replace \"    <script>\", \"    <script src=\"\"js/config.js\"\"></script>`n    <script>\" | Set-Content 'frontend\register.html'"

echo Done! All API URLs fixed for mobile access.
pause