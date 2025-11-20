-- Cập nhật giá dịch vụ cụ thể bằng ID
-- Trước tiên xem danh sách dịch vụ hiện tại
SELECT id, name, price, category FROM services;

-- Cập nhật từng dịch vụ theo ID (thay đổi ID phù hợp)
-- Ví dụ: nếu dịch vụ "bơi" có ID = 1 và giá = 50
UPDATE services SET price = 50000 WHERE id = 1 AND price = 50;

-- Nếu có dịch vụ "giặt ủi" có ID = 2 và giá = 50  
UPDATE services SET price = 50000 WHERE id = 2 AND price = 50;

-- Thêm dịch vụ bơi lội mới nếu chưa có
INSERT INTO services (name, price, category, description) 
VALUES ('Bơi lội', 50000, 'other', 'Sử dụng hồ bơi khách sạn')
ON DUPLICATE KEY UPDATE price = 50000;

-- Kiểm tra kết quả
SELECT id, name, price, category FROM services ORDER BY name;