-- Tắt safe update mode tạm thời
SET SQL_SAFE_UPDATES = 0;

-- Cập nhật giá dịch vụ đúng định dạng (sử dụng id để an toàn)
UPDATE services SET price = 50000 WHERE id IN (SELECT * FROM (SELECT id FROM services WHERE name LIKE '%bơi%' AND price < 1000) AS temp);
UPDATE services SET price = 50000 WHERE id IN (SELECT * FROM (SELECT id FROM services WHERE name LIKE '%giặt%' AND price < 1000) AS temp);
UPDATE services SET price = 200000 WHERE id IN (SELECT * FROM (SELECT id FROM services WHERE name LIKE '%massage%' AND price < 1000) AS temp);
UPDATE services SET price = 300000 WHERE id IN (SELECT * FROM (SELECT id FROM services WHERE name LIKE '%sân bay%' AND price < 1000) AS temp);
UPDATE services SET price = 100000 WHERE id IN (SELECT * FROM (SELECT id FROM services WHERE name LIKE '%phòng%' AND price < 1000) AS temp);
UPDATE services SET price = 200000 WHERE id IN (SELECT * FROM (SELECT id FROM services WHERE name LIKE '%gym%' AND price < 1000) AS temp);

-- Thêm dịch vụ bơi lội nếu chưa có
INSERT IGNORE INTO services (name, price, category, description) 
VALUES ('Bơi lội', 50000, 'other', 'Sử dụng hồ bơi khách sạn');

-- Bật lại safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Hiển thị kết quả
SELECT id, name, price, category FROM services ORDER BY name;