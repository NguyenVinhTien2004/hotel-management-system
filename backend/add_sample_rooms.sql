-- ===========================
-- THÊM PHÒNG MẪU VÀO DATABASE
-- ===========================
USE quanlykhachsan;

-- Thêm 20 phòng (mỗi loại 5 phòng)
INSERT INTO rooms (number, name, type, price, capacity, status) VALUES
-- Phòng Đơn (5 phòng)
('101', 'Phòng Hoa Sen', 'Đơn', 500000, 1, 'available'),
('102', 'Phòng Hoa Đào', 'Đơn', 500000, 1, 'available'),
('103', 'Phòng Hoa Mai', 'Đơn', 500000, 1, 'available'),
('104', 'Phòng Hoa Cúc', 'Đơn', 500000, 1, 'available'),
('105', 'Phòng Hoa Hướng Dương', 'Đơn', 500000, 1, 'available'),

-- Phòng Đôi (5 phòng)
('201', 'Phòng Biển Xanh', 'Đôi', 800000, 2, 'available'),
('202', 'Phòng Biển Bạc', 'Đôi', 800000, 2, 'available'),
('203', 'Phòng Biển Vàng', 'Đôi', 800000, 2, 'available'),
('204', 'Phòng Biển Ngọc', 'Đôi', 800000, 2, 'available'),
('205', 'Phòng Biển Hồng', 'Đôi', 800000, 2, 'available'),

-- Phòng Gia Đình (5 phòng)
('301', 'Phòng Gia Đình Hạnh Phúc', 'Gia Đình', 1200000, 4, 'available'),
('302', 'Phòng Gia Đình Yêu Thương', 'Gia Đình', 1200000, 4, 'available'),
('303', 'Phòng Gia Đình Ấm Áp', 'Gia Đình', 1200000, 4, 'available'),
('304', 'Phòng Gia Đình Bình An', 'Gia Đình', 1200000, 4, 'available'),
('305', 'Phòng Gia Đình Thịnh Vượng', 'Gia Đình', 1200000, 4, 'available'),

-- Phòng VIP (5 phòng)
('401', 'Phòng VIP Hoàng Gia', 'VIP', 2000000, 2, 'available'),
('402', 'Phòng VIP Tổng Thống', 'VIP', 2000000, 2, 'available'),
('403', 'Phòng VIP Hoàng Hậu', 'VIP', 2000000, 2, 'available'),
('404', 'Phòng VIP Thiên Đường', 'VIP', 2000000, 2, 'available'),
('405', 'Phòng VIP Kim Cương', 'VIP', 2000000, 2, 'available');

-- Kiểm tra đã thêm thành công
SELECT * FROM rooms;