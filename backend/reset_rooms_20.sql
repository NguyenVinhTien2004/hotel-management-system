-- ===========================
-- RESET VÀ THÊM 20 PHÒNG MỚI
-- ===========================
USE quanlykhachsan;

-- Xóa tất cả phòng hiện có
DELETE FROM rooms;

-- Reset AUTO_INCREMENT
ALTER TABLE rooms AUTO_INCREMENT = 1;

-- Thêm 20 phòng mới (mỗi loại 5 phòng)
INSERT INTO rooms (number, name, type, price, capacity, image, status) VALUES
-- Phòng Đơn (5 phòng) - Tầng 1
('101', 'Phòng Hoa Sen', 'Đơn', 500000, 1, '/images/phong-don.jpg', 'available'),
('102', 'Phòng Hoa Đào', 'Đơn', 500000, 1, '/images/phong-don.jpg', 'available'),
('103', 'Phòng Hoa Mai', 'Đơn', 500000, 1, '/images/phong-don.jpg', 'available'),
('104', 'Phòng Hoa Cúc', 'Đơn', 500000, 1, '/images/phong-don.jpg', 'available'),
('105', 'Phòng Hoa Hướng Dương', 'Đơn', 500000, 1, '/images/phong-don.jpg', 'available'),

-- Phòng Đôi (5 phòng) - Tầng 2
('201', 'Phòng Biển Xanh', 'Đôi', 800000, 2, '/images/phong-doi.jpg', 'available'),
('202', 'Phòng Biển Bạc', 'Đôi', 800000, 2, '/images/phong-doi.jpg', 'available'),
('203', 'Phòng Biển Vàng', 'Đôi', 800000, 2, '/images/phong-doi.jpg', 'available'),
('204', 'Phòng Biển Ngọc', 'Đôi', 800000, 2, '/images/phong-doi.jpg', 'available'),
('205', 'Phòng Biển Hồng', 'Đôi', 800000, 2, '/images/phong-doi.jpg', 'available'),

-- Phòng Gia Đình (5 phòng) - Tầng 3
('301', 'Phòng Gia Đình Hạnh Phúc', 'Gia Đình', 1200000, 4, '/images/phong-gia-dinh.jpg', 'available'),
('302', 'Phòng Gia Đình Yêu Thương', 'Gia Đình', 1200000, 4, '/images/phong-gia-dinh.jpg', 'available'),
('303', 'Phòng Gia Đình Ấm Áp', 'Gia Đình', 1200000, 4, '/images/phong-gia-dinh.jpg', 'available'),
('304', 'Phòng Gia Đình Bình An', 'Gia Đình', 1200000, 4, '/images/phong-gia-dinh.jpg', 'available'),
('305', 'Phòng Gia Đình Thịnh Vượng', 'Gia Đình', 1200000, 4, '/images/phong-gia-dinh.jpg', 'available'),

-- Phòng VIP (5 phòng) - Tầng 4
('401', 'Phòng VIP Hoàng Gia', 'VIP', 2000000, 2, '/images/phong-vip.jpg', 'available'),
('402', 'Phòng VIP Tổng Thống', 'VIP', 2000000, 2, '/images/phong-vip.jpg', 'available'),
('403', 'Phòng VIP Hoàng Hậu', 'VIP', 2000000, 2, '/images/phong-vip.jpg', 'available'),
('404', 'Phòng VIP Thiên Đường', 'VIP', 2000000, 2, '/images/phong-vip.jpg', 'available'),
('405', 'Phòng VIP Kim Cương', 'VIP', 2000000, 2, '/images/phong-vip.jpg', 'available');

-- Kiểm tra kết quả
SELECT 
    type as 'Loại phòng',
    COUNT(*) as 'Số lượng',
    MIN(number) as 'Từ phòng',
    MAX(number) as 'Đến phòng',
    CONCAT(FORMAT(price, 0), ' VND') as 'Giá'
FROM rooms 
GROUP BY type, price 
ORDER BY price;

SELECT 'Tổng số phòng:' as '', COUNT(*) as 'Số lượng' FROM rooms;