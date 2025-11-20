USE quanlykhachsan;

-- Bước 1: Thêm cột image nếu chưa có
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image VARCHAR(255) DEFAULT NULL;

-- Bước 2: Xóa dữ liệu cũ
DELETE FROM rooms;

-- Bước 3: Reset AUTO_INCREMENT
ALTER TABLE rooms AUTO_INCREMENT = 1;

-- Bước 4: Thêm 20 phòng mới
INSERT INTO rooms (number, name, type, price, capacity, image, status) VALUES
('101', 'Phong Hoa Sen', 'Don', 500000, 1, '/images/phong-don.jpg', 'available'),
('102', 'Phong Hoa Dao', 'Don', 500000, 1, '/images/phong-don.jpg', 'available'),
('103', 'Phong Hoa Mai', 'Don', 500000, 1, '/images/phong-don.jpg', 'available'),
('104', 'Phong Hoa Cuc', 'Don', 500000, 1, '/images/phong-don.jpg', 'available'),
('105', 'Phong Hoa Huong Duong', 'Don', 500000, 1, '/images/phong-don.jpg', 'available'),
('201', 'Phong Bien Xanh', 'Doi', 800000, 2, '/images/phong-doi.jpg', 'available'),
('202', 'Phong Bien Bac', 'Doi', 800000, 2, '/images/phong-doi.jpg', 'available'),
('203', 'Phong Bien Vang', 'Doi', 800000, 2, '/images/phong-doi.jpg', 'available'),
('204', 'Phong Bien Ngoc', 'Doi', 800000, 2, '/images/phong-doi.jpg', 'available'),
('205', 'Phong Bien Hong', 'Doi', 800000, 2, '/images/phong-doi.jpg', 'available'),
('301', 'Phong Gia Dinh Hanh Phuc', 'Gia Dinh', 1200000, 4, '/images/phong-gia-dinh.jpg', 'available'),
('302', 'Phong Gia Dinh Yeu Thuong', 'Gia Dinh', 1200000, 4, '/images/phong-gia-dinh.jpg', 'available'),
('303', 'Phong Gia Dinh Am Ap', 'Gia Dinh', 1200000, 4, '/images/phong-gia-dinh.jpg', 'available'),
('304', 'Phong Gia Dinh Binh An', 'Gia Dinh', 1200000, 4, '/images/phong-gia-dinh.jpg', 'available'),
('305', 'Phong Gia Dinh Thinh Vuong', 'Gia Dinh', 1200000, 4, '/images/phong-gia-dinh.jpg', 'available'),
('401', 'Phong VIP Hoang Gia', 'VIP', 2000000, 2, '/images/phong-vip.jpg', 'available'),
('402', 'Phong VIP Tong Thong', 'VIP', 2000000, 2, '/images/phong-vip.jpg', 'available'),
('403', 'Phong VIP Hoang Hau', 'VIP', 2000000, 2, '/images/phong-vip.jpg', 'available'),
('404', 'Phong VIP Thien Duong', 'VIP', 2000000, 2, '/images/phong-vip.jpg', 'available'),
('405', 'Phong VIP Kim Cuong', 'VIP', 2000000, 2, '/images/phong-vip.jpg', 'available');

-- Bước 5: Kiểm tra kết quả
SELECT COUNT(*) as 'Total Rooms' FROM rooms;
SELECT type, COUNT(*) as 'Count' FROM rooms GROUP BY type;
SELECT number, name, type, price FROM rooms ORDER BY number;