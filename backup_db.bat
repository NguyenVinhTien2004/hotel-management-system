@echo off
echo Backing up database...
"C:\Program Files\MySQL\MySQL Workbench 8.0\mysqldump.exe" -u root -p quanlykhachsan > hotel_database_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql
echo Backup completed!
pause