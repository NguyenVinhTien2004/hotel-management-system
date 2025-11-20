@echo off
echo ===========================
echo SETUP DATABASE KHACH SAN
echo ===========================

echo Dang ket noi MySQL...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS quanlykhachsan;"

echo Dang tao cau truc database...
mysql -u root -p quanlykhachsan < backend\database_schema.sql

echo Dang them du lieu phong mau...
mysql -u root -p quanlykhachsan < backend\reset_rooms_20.sql

echo Dang them du lieu dich vu mau...
mysql -u root -p quanlykhachsan -e "INSERT IGNORE INTO services (name, price, category, description) VALUES ('Dua don san bay', 300000, 'transport', 'Dich vu dua don tu/den san bay'), ('An sang', 100000, 'food', 'Buffet sang tai nha hang'), ('Giat ui', 100000, 'laundry', 'Dich vu giat ui quan ao');"

echo ===========================
echo HOAN THANH SETUP DATABASE!
echo ===========================
pause