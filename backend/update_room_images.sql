-- ===========================
-- CẬP NHẬT HÌNH ẢNH RIÊNG CHO TỪNG PHÒNG
-- ===========================
USE quanlykhachsan;

-- Cập nhật hình ảnh cho từng phòng đơn
UPDATE rooms SET image = '/images/phong-don/room1.jpg' WHERE number = '101';
UPDATE rooms SET image = '/images/phong-don/room2.jpg' WHERE number = '102';
UPDATE rooms SET image = '/images/phong-don/room3.jpg' WHERE number = '103';
UPDATE rooms SET image = '/images/phong-don/room4.jpg' WHERE number = '104';
UPDATE rooms SET image = '/images/phong-don/room5.jpg' WHERE number = '105';

-- Cập nhật hình ảnh cho từng phòng đôi
UPDATE rooms SET image = '/images/phong-doi/room1.jpg' WHERE number = '201';
UPDATE rooms SET image = '/images/phong-doi/room2.jpg' WHERE number = '202';
UPDATE rooms SET image = '/images/phong-doi/room3.jpg' WHERE number = '203';
UPDATE rooms SET image = '/images/phong-doi/room4.jpg' WHERE number = '204';
UPDATE rooms SET image = '/images/phong-doi/room5.jpg' WHERE number = '205';

-- Cập nhật hình ảnh cho từng phòng gia đình
UPDATE rooms SET image = '/images/phong-gia-dinh/room1.jpg' WHERE number = '301';
UPDATE rooms SET image = '/images/phong-gia-dinh/room2.jpg' WHERE number = '302';
UPDATE rooms SET image = '/images/phong-gia-dinh/room3.jpg' WHERE number = '303';
UPDATE rooms SET image = '/images/phong-gia-dinh/room4.jpg' WHERE number = '304';
UPDATE rooms SET image = '/images/phong-gia-dinh/room5.jpg' WHERE number = '305';

-- Cập nhật hình ảnh cho từng phòng VIP
UPDATE rooms SET image = '/images/phong-vip/room1.jpg' WHERE number = '401';
UPDATE rooms SET image = '/images/phong-vip/room2.jpg' WHERE number = '402';
UPDATE rooms SET image = '/images/phong-vip/room3.jpg' WHERE number = '403';
UPDATE rooms SET image = '/images/phong-vip/room4.jpg' WHERE number = '404';
UPDATE rooms SET image = '/images/phong-vip/room5.jpg' WHERE number = '405';

-- Kiểm tra kết quả
SELECT number, name, type, image FROM rooms ORDER BY number;