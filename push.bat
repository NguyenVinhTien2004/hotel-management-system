@echo off
echo Uploading to GitHub...
git add .
git commit -m "Update %date% %time%"
git push
echo.
echo Upload completed!
pause