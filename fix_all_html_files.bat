@echo off
echo Đang sửa tất cả file HTML để loại bỏ lỗi...

cd "frontend-20251108T081940Z-1-001\frontend"

echo Đang sao chép tailwind-local.css...
if not exist "tailwind-local.css" (
    echo Lỗi: Không tìm thấy tailwind-local.css
    pause
    exit /b 1
)

echo Đang sửa các file HTML...

REM Sửa tất cả file HTML
for %%f in (*.html) do (
    echo Đang sửa %%f...
    
    REM Backup file gốc
    copy "%%f" "%%f.backup" >nul 2>&1
    
    REM Thay thế Tailwind CDN
    powershell -Command "(Get-Content '%%f') -replace 'https://cdn.tailwindcss.com', 'tailwind-local.css' | Set-Content '%%f'"
    
    REM Sửa meta tag deprecated
    powershell -Command "(Get-Content '%%f') -replace 'apple-mobile-web-app-capable', 'mobile-web-app-capable' | Set-Content '%%f'"
    
    REM Sửa đường dẫn manifest và service worker
    powershell -Command "(Get-Content '%%f') -replace 'href=\"/manifest.json\"', 'href=\"./manifest.json\"' | Set-Content '%%f'"
    powershell -Command "(Get-Content '%%f') -replace 'register\(''/sw.js''\)', 'register(''./sw.js'')' | Set-Content '%%f'"
)

echo Hoàn thành! Tất cả file HTML đã được sửa.
echo Các file backup được lưu với đuôi .backup
echo.
echo Để khôi phục file gốc (nếu cần): ren filename.html.backup filename.html
pause