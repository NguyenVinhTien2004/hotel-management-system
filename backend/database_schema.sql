-- ===========================
-- DATABASE QUẢN LÝ KHÁCH SẠN
-- ===========================
CREATE DATABASE IF NOT EXISTS quanlykhachsan;
USE quanlykhachsan;

-- ===========================
-- 1️⃣ BẢNG USERS (Tài khoản đăng nhập)
-- ===========================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer', -- admin, staff, customer
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- 2️⃣ BẢNG ROOMS (Phòng)
-- ===========================
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- Đơn, Đôi, Gia Đình, VIP
    price DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL,
    image VARCHAR(255) DEFAULT NULL, -- Đường dẫn hình ảnh
    status VARCHAR(20) DEFAULT 'available', -- available, occupied, maintenance
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- 3️⃣ BẢNG CUSTOMERS (Khách hàng)
-- ===========================
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    address TEXT,
    id_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- 4️⃣ BẢNG BOOKINGS (Đặt phòng)
-- ===========================
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    room_id INT NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    room_name VARCHAR(100),
    room_type VARCHAR(50),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guest_count INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'cash', -- cash, bank_transfer, credit_card
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, checked_in, checked_out, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- ===========================
-- 5️⃣ BẢNG SERVICES (Dịch vụ)
-- ===========================
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL, -- food, transport, spa, laundry, cleaning, other
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- 6️⃣ BẢNG FEEDBACK (Đánh giá)
-- ===========================
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    room_name VARCHAR(100),
    room_rating INT NOT NULL CHECK (room_rating >= 1 AND room_rating <= 5),
    service_rating INT NOT NULL CHECK (service_rating >= 1 AND service_rating <= 5),
    comment TEXT,
    check_in DATE,
    check_out DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- ===========================
-- 7️⃣ BẢNG INVOICES (Hóa đơn)
-- ===========================
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    room_charges DECIMAL(10,2) NOT NULL,
    service_charges DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- ===========================
-- 8️⃣ BẢNG INVOICE_SERVICES (Dịch vụ trong hóa đơn)
-- ===========================
CREATE TABLE invoice_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    service_id INT NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    quantity INT DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- ===========================
-- 9️⃣ BẢNG ADMIN_LOGS (Nhật ký hoạt động)
-- ===========================
CREATE TABLE admin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    admin_name VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE
    target_type VARCHAR(50) NOT NULL, -- room, booking, customer, service, invoice
    target_id INT NOT NULL,
    reason TEXT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- ===========================
-- 🔟 BẢNG NOTIFICATIONS (Thông báo)
-- ===========================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- new_booking, new_feedback, new_service, etc.
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    booking_id INT,
    feedback_id INT,
    service_id INT,
    for_customers BOOLEAN DEFAULT FALSE,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- ✅ DATABASE HOÀN THÀNH
-- ===========================
-- Chỉ tạo cấu trúc bảng, không có dữ liệu mẫu
-- Dữ liệu sẽ được thêm khi:
-- - Admin tạo phòng, dịch vụ
-- - Khách hàng đăng ký, đặt phòng
-- - Có hoạt động thực tế trong hệ thống