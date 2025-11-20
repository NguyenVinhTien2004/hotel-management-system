USE quanlykhachsan;

-- Thay đổi cấu trúc cột price thành VARCHAR để lưu định dạng VND
ALTER TABLE rooms MODIFY COLUMN price VARCHAR(50);

DELETE FROM rooms;
ALTER TABLE rooms AUTO_INCREMENT = 1;

INSERT INTO rooms (number, name, type, price, capacity, status) VALUES
-- Phòng Đơn (5 phòng)
('101', 'Phòng Hoa Sen', 'Đơn', '500.000 VND', 1, 'available'),
('102', 'Phòng Hoa Đào', 'Đơn', '500.000 VND', 1, 'available'),
('103', 'Phòng Hoa Mai', 'Đơn', '500.000 VND', 1, 'available'),
('104', 'Phòng Hoa Cúc', 'Đơn', '500.000 VND', 1, 'available'),
('105', 'Phòng Hướng Dương', 'Đơn', '500.000 VND', 1, 'available'),

-- Phòng Đôi (5 phòng)
('201', 'Phòng Biển Xanh', 'Đôi', '800.000 VND', 2, 'available'),
('202', 'Phòng Biển Bạc', 'Đôi', '800.000 VND', 2, 'available'),
('203', 'Phòng Biển Vàng', 'Đôi', '800.000 VND', 2, 'available'),
('204', 'Phòng Biển Ngọc', 'Đôi', '800.000 VND', 2, 'available'),
('205', 'Phòng Biển Hồng', 'Đôi', '800.000 VND', 2, 'available'),

-- Phòng Gia Đình (5 phòng)
('301', 'Phòng Gia Đình Hạnh Phúc', 'Gia Đình', '1.200.000 VND', 4, 'available'),
('302', 'Phòng Gia Đình Yêu Thương', 'Gia Đình', '1.200.000 VND', 4, 'available'),
('303', 'Phòng Gia Đình Ấm Ấp', 'Gia Đình', '1.200.000 VND', 4, 'available'),
('304', 'Phòng Gia Đình Bình An', 'Gia Đình', '1.200.000 VND', 4, 'available'),
('305', 'Phòng Gia Đình Thịnh Vượng', 'Gia Đình', '1.200.000 VND', 4, 'available'),

-- Phòng VIP (5 phòng)
('401', 'Phòng VIP Hoàng Gia', 'VIP', '2.000.000 VND', 2, 'available'),
('402', 'Phòng VIP Tổng Thống', 'VIP', '2.000.000 VND', 2, 'available'),
('403', 'Phòng VIP Hoàng Hậu', 'VIP', '2.000.000 VND', 2, 'available'),
('404', 'Phòng VIP Thiên Đường', 'VIP', '2.000.000 VND', 2, 'available'),
('405', 'Phòng VIP Kim Cương', 'VIP', '2.000.000 VND', 2, 'available');

SELECT COUNT(*) as 'Total Rooms' FROM rooms;
SELECT type, COUNT(*) as 'Count' FROM rooms GROUP BY type;
SELECT number, name, type, price FROM rooms ORDER BY number;