const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Detect database type from environment
const isPostgreSQL = process.env.DATABASE_URL || process.env.NODE_ENV === 'production';

let pool;

if (isPostgreSQL) {
    // PostgreSQL for production (Render)
    const { Pool } = require('pg');
    
    const connectionString = process.env.DATABASE_URL;
    console.log('🔍 Using PostgreSQL database');
    
    pool = new Pool({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
} else {
    // MySQL for local development
    const mysql = require('mysql2/promise');
    
    console.log('🔍 Using MySQL database');
    console.log('🔍 DB Config:', {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD ? '***' : 'NO PASSWORD',
        database: process.env.DB_NAME || 'quanlykhachsan'
    });
    
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root', 
        password: process.env.DB_PASSWORD || '123456789@',
        database: process.env.DB_NAME || 'quanlykhachsan',
        port: parseInt(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

async function testConnection() {
    try {
        if (isPostgreSQL) {
            const client = await pool.connect();
            console.log('✅ PostgreSQL connection successful');
            client.release();
        } else {
            const connection = await pool.getConnection();
            console.log('✅ MySQL connection successful');
            connection.release();
        }
        return true;
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        throw error;
    }
}

async function execute(query, params = []) {
    if (isPostgreSQL) {
        const result = await pool.query(query, params);
        return [result.rows, result];
    } else {
        return await pool.execute(query, params);
    }
}

async function initDatabase() {
    try {
        console.log('🔄 Initializing database...');
        
        // Create tables - PostgreSQL syntax
        if (isPostgreSQL) {
            await execute(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100),
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await execute(`
                CREATE TABLE IF NOT EXISTS rooms (
                    id SERIAL PRIMARY KEY,
                    number VARCHAR(10) UNIQUE NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    type VARCHAR(20) NOT NULL CHECK (type IN ('Đơn', 'Đôi', 'Gia Đình', 'VIP')),
                    price DECIMAL(10,2) NOT NULL,
                    capacity INTEGER NOT NULL,
                    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
                    image VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await execute(`
                CREATE TABLE IF NOT EXISTS bookings (
                    id SERIAL PRIMARY KEY,
                    customer_name VARCHAR(100) NOT NULL,
                    customer_phone VARCHAR(20) NOT NULL,
                    customer_email VARCHAR(100),
                    room_id INTEGER NOT NULL,
                    room_number VARCHAR(10) NOT NULL,
                    room_name VARCHAR(100) NOT NULL,
                    room_type VARCHAR(50) NOT NULL,
                    check_in DATE NOT NULL,
                    check_out DATE NOT NULL,
                    guest_count INTEGER NOT NULL,
                    total_amount DECIMAL(10,2) NOT NULL,
                    payment_method VARCHAR(50) DEFAULT 'cash',
                    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await execute(`
                CREATE TABLE IF NOT EXISTS services (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    price DECIMAL(10,2) NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await execute(`
                CREATE TABLE IF NOT EXISTS customers (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    phone VARCHAR(20) UNIQUE NOT NULL,
                    email VARCHAR(100),
                    address TEXT,
                    id_number VARCHAR(20),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await execute(`
                CREATE TABLE IF NOT EXISTS feedback (
                    id SERIAL PRIMARY KEY,
                    booking_id INTEGER NOT NULL,
                    customer_name VARCHAR(100) NOT NULL,
                    room_number VARCHAR(10) NOT NULL,
                    room_name VARCHAR(100) NOT NULL,
                    room_rating INTEGER CHECK (room_rating >= 1 AND room_rating <= 5),
                    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
                    comment TEXT,
                    check_in DATE,
                    check_out DATE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await execute(`
                CREATE TABLE IF NOT EXISTS invoices (
                    id SERIAL PRIMARY KEY,
                    booking_id INTEGER NOT NULL,
                    customer_name VARCHAR(100) NOT NULL,
                    room_charges DECIMAL(10,2) NOT NULL,
                    service_charges DECIMAL(10,2) DEFAULT 0,
                    total_amount DECIMAL(10,2) NOT NULL,
                    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await execute(`
                CREATE TABLE IF NOT EXISTS invoice_services (
                    id SERIAL PRIMARY KEY,
                    invoice_id INTEGER NOT NULL,
                    service_id INTEGER,
                    service_name VARCHAR(100) NOT NULL,
                    quantity INTEGER DEFAULT 1,
                    price DECIMAL(10,2) NOT NULL,
                    total DECIMAL(10,2) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await execute(`
                CREATE TABLE IF NOT EXISTS notifications (
                    id SERIAL PRIMARY KEY,
                    type VARCHAR(50) NOT NULL,
                    title VARCHAR(200) NOT NULL,
                    message TEXT NOT NULL,
                    booking_id INTEGER,
                    feedback_id INTEGER,
                    service_id INTEGER,
                    for_customers BOOLEAN DEFAULT FALSE,
                    read_status BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await execute(`
                CREATE TABLE IF NOT EXISTS admin_logs (
                    id SERIAL PRIMARY KEY,
                    admin_id INTEGER NOT NULL,
                    admin_name VARCHAR(100) NOT NULL,
                    action VARCHAR(50) NOT NULL,
                    target_type VARCHAR(50) NOT NULL,
                    target_id INTEGER,
                    reason VARCHAR(255),
                    details TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
        } else {
            // MySQL syntax (existing code)
            await execute(`
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

            await execute(`
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

            await execute(`
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

            await execute(`
                CREATE TABLE IF NOT EXISTS services (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    price DECIMAL(10,2) NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await execute(`
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

            await execute(`
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

            await execute(`
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

            await execute(`
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

            await execute(`
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

            await execute(`
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
        }

        console.log('✅ Database tables initialized');
        
        // Add sample data if empty
        const [rooms] = await execute('SELECT COUNT(*) as count FROM rooms');
        const roomCount = isPostgreSQL ? rooms[0].count : rooms[0].count;
        
        if (roomCount == 0) {
            console.log('🔄 Adding sample rooms...');
            const sampleRooms = [
                ['101', 'Phòng Đơn Tiêu Chuẩn', 'Đơn', 500000, 1],
                ['102', 'Phòng Đôi Tiêu Chuẩn', 'Đôi', 800000, 2],
                ['201', 'Phòng Gia Đình', 'Gia Đình', 1200000, 4],
                ['301', 'Phòng VIP', 'VIP', 2000000, 2]
            ];
            
            for (const room of sampleRooms) {
                await execute(
                    'INSERT INTO rooms (number, name, type, price, capacity) VALUES ($1, $2, $3, $4, $5)',
                    room
                );
            }
            console.log('✅ Sample rooms added');
        }

        // Add sample services
        const [services] = await execute('SELECT COUNT(*) as count FROM services');
        const serviceCount = isPostgreSQL ? services[0].count : services[0].count;
        
        if (serviceCount == 0) {
            console.log('🔄 Adding sample services...');
            const sampleServices = [
                ['Giặt ủi', 50000, 'laundry', 'Dịch vụ giặt ủi chuyên nghiệp'],
                ['Massage', 200000, 'spa', 'Dịch vụ massage thư giãn'],
                ['Xe đưa đón sân bay', 300000, 'transport', 'Đưa đón từ/đến sân bay'],
                ['Phục vụ phòng', 100000, 'other', 'Dịch vụ dọn dẹp phòng']
            ];
            
            for (const service of sampleServices) {
                await execute(
                    'INSERT INTO services (name, price, category, description) VALUES ($1, $2, $3, $4)',
                    service
                );
            }
            console.log('✅ Sample services added');
        }

    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    }
}

module.exports = { pool, testConnection, initDatabase, execute, isPostgreSQL };