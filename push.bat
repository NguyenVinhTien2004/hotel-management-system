@echo off
echo Uploading to GitHub...
git add .
git commit -m "Update %date% %time%"
git push origin main
echo.
echo Upload completed!
pause