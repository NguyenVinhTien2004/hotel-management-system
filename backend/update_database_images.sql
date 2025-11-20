-- ===========================
-- CẬP NHẬT DATABASE THÊM CỘT IMAGE
-- ===========================
USE quanlykhachsan;

-- Thêm cột image vào bảng rooms (nếu chưa có)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image VARCHAR(255) DEFAULT NULL COMMENT 'Đường dẫn hình ảnh phòng';

-- Cập nhật hình ảnh cho các phòng hiện có dựa trên loại phòng
UPDATE rooms SET image = '/images/phong-don.jpg' WHERE type = 'Đơn';
UPDATE rooms SET image = '/images/phong-doi.jpg' WHERE type = 'Đôi';
UPDATE rooms SET image = '/images/phong-gia-dinh.jpg' WHERE type = 'Gia Đình';
UPDATE rooms SET image = '/images/phong-vip.jpg' WHERE type = 'VIP';

-- Kiểm tra kết quả
SELECT id, number, name, type, price, image FROM rooms;