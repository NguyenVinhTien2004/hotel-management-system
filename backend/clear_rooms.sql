-- ===========================
-- XÓA TẤT CẢ DỮ LIỆU TRONG BẢNG ROOMS
-- ===========================

USE quanlykhachsan;

-- Tắt kiểm tra foreign key tạm thời
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa tất cả dữ liệu trong bảng rooms
DELETE FROM rooms;

-- Reset AUTO_INCREMENT về 1
ALTER TABLE rooms AUTO_INCREMENT = 1;

-- Bật lại kiểm tra foreign key
SET FOREIGN_KEY_CHECKS = 1;

-- Kiểm tra kết quả
SELECT COUNT(*) as total_rooms FROM rooms;

-- ===========================
-- HOÀN THÀNH
-- ===========================