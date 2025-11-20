-- Sửa giá dịch vụ để có định dạng đúng
UPDATE services SET price = 50000 WHERE name = 'Bơi lội' OR name = 'Bơi';
UPDATE services SET price = 150000 WHERE name = 'Xông Hơi';
UPDATE services SET price = 200000 WHERE name = 'tập gym' OR name = 'Tập gym';
UPDATE services SET price = 300000 WHERE name = 'đưa đón sân bay' OR name = 'Đưa đón sân bay';
UPDATE services SET price = 100000 WHERE name = 'ăn uống' OR name = 'Ăn uống';
UPDATE services SET price = 100000 WHERE name = 'giặt ủi' OR name = 'Giặt ủi';

-- Hiển thị kết quả
SELECT id, name, price FROM services ORDER BY name;