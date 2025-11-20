const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('🔍 DB Config:', {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ? '***' : 'NO PASSWORD',
    database: process.env.DB_NAME || 'quanlykhachsan'
});

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || '123456789@',
    database: process.env.DB_NAME || 'quanlykhachsan',
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Kết nối database thành công');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Lỗi kết nối database:', error.message);
        throw error;
    }
}

async function initDatabase() {
    try {
        // Create tables if not exist
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100),
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'staff', 'customer') DEFAULT 'customer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS rooms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                number VARCHAR(10) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                type ENUM('Đơn', 'Đôi', 'Gia Đình', 'VIP') NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                capacity INT NOT NULL,
                status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
                image VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_name VARCHAR(100) NOT NULL,
                customer_phone VARCHAR(20) NOT NULL,
                customer_email VARCHAR(100),
                room_id INT NOT NULL,
                room_number VARCHAR(10) NOT NULL,
                room_name VARCHAR(100) NOT NULL,
                room_type VARCHAR(50) NOT NULL,
                check_in DATE NOT NULL,
                check_out DATE NOT NULL,
                guest_count INT NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                payment_method VARCHAR(50) DEFAULT 'cash',
                status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                category VARCHAR(50) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS customers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) UNIQUE NOT NULL,
                email VARCHAR(100),
                address TEXT,
                id_number VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS feedback (
                id INT AUTO_INCREMENT PRIMARY KEY,
                booking_id INT NOT NULL,
                customer_name VARCHAR(100) NOT NULL,
                room_number VARCHAR(10) NOT NULL,
                room_name VARCHAR(100) NOT NULL,
                room_rating INT CHECK (room_rating >= 1 AND room_rating <= 5),
                service_rating INT CHECK (service_rating >= 1 AND service_rating <= 5),
                comment TEXT,
                check_in DATE,
                check_out DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS invoices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                booking_id INT NOT NULL,
                customer_name VARCHAR(100) NOT NULL,
                room_charges DECIMAL(10,2) NOT NULL,
                service_charges DECIMAL(10,2) DEFAULT 0,
                total_amount DECIMAL(10,2) NOT NULL,
                status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS invoice_services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_id INT NOT NULL,
                service_id INT,
                service_name VARCHAR(100) NOT NULL,
                quantity INT DEFAULT 1,
                price DECIMAL(10,2) NOT NULL,
                total DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                booking_id INT,
                feedback_id INT,
                service_id INT,
                for_customers BOOLEAN DEFAULT FALSE,
                read_status BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS admin_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                admin_id INT NOT NULL,
                admin_name VARCHAR(100) NOT NULL,
                action VARCHAR(50) NOT NULL,
                target_type VARCHAR(50) NOT NULL,
                target_id INT,
                reason VARCHAR(255),
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Database tables initialized');
        
        // Add sample data if empty
        const [rooms] = await pool.execute('SELECT COUNT(*) as count FROM rooms');
        if (rooms[0].count === 0) {
            console.log('🔄 Adding sample rooms...');
            const sampleRooms = [
                ['101', 'Phòng Đơn Tiêu Chuẩn', 'Đơn', 500000, 1],
                ['102', 'Phòng Đôi Tiêu Chuẩn', 'Đôi', 800000, 2],
                ['201', 'Phòng Gia Đình', 'Gia Đình', 1200000, 4],
                ['301', 'Phòng VIP', 'VIP', 2000000, 2]
            ];
            
            for (const room of sampleRooms) {
                await pool.execute(
                    'INSERT INTO rooms (number, name, type, price, capacity) VALUES (?, ?, ?, ?, ?)',
                    room
                );
            }
            console.log('✅ Sample rooms added');
        }

    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    }
}

module.exports = { pool, testConnection, initDatabase };