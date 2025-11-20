const mysql = require('mysql2/promise');

// Cấu hình kết nối MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456789@',
    database: 'quanlykhachsan',
    port: 3306
};

// Tạo connection pool
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test kết nối
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Kết nối MySQL thành công!');
        connection.release();
    } catch (error) {
        console.error('❌ Lỗi kết nối MySQL:', error.message);
    }
}

// Khởi tạo database và tables
async function initDatabase() {
    try {
        // Tạo database nếu chưa có
        const tempConnection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            port: dbConfig.port
        });
        
        await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        await tempConnection.end();
        
        // Tạo các bảng
        await createTables();
        console.log('✅ Khởi tạo database thành công!');
    } catch (error) {
        console.error('❌ Lỗi khởi tạo database:', error.message);
    }
}

// Tạo các bảng
async function createTables() {
    const tables = [
        // Bảng users
        `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100),
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'staff',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Bảng rooms
        `CREATE TABLE IF NOT EXISTS rooms (
            id INT AUTO_INCREMENT PRIMARY KEY,
            number VARCHAR(10) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            type VARCHAR(50) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            capacity INT NOT NULL,
            image VARCHAR(255),
            status VARCHAR(20) DEFAULT 'available',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Bảng customers
        `CREATE TABLE IF NOT EXISTS customers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) UNIQUE NOT NULL,
            email VARCHAR(100),
            address TEXT,
            id_number VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Bảng bookings
        `CREATE TABLE IF NOT EXISTS bookings (
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
            payment_method VARCHAR(20) DEFAULT 'cash',
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id) REFERENCES rooms(id)
        )`,
        
        // Bảng services
        `CREATE TABLE IF NOT EXISTS services (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            category VARCHAR(50) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Bảng feedback
        `CREATE TABLE IF NOT EXISTS feedback (
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
        )`,
        
        // Bảng invoices (hóa đơn)
        `CREATE TABLE IF NOT EXISTS invoices (
            id INT AUTO_INCREMENT PRIMARY KEY,
            booking_id INT NOT NULL,
            customer_name VARCHAR(100) NOT NULL,
            room_charges DECIMAL(10,2) NOT NULL,
            service_charges DECIMAL(10,2) DEFAULT 0,
            total_amount DECIMAL(10,2) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id)
        )`,
        
        // Bảng invoice_services (dịch vụ trong hóa đơn)
        `CREATE TABLE IF NOT EXISTS invoice_services (
            id INT AUTO_INCREMENT PRIMARY KEY,
            invoice_id INT NOT NULL,
            service_id INT NOT NULL,
            service_name VARCHAR(100) NOT NULL,
            quantity INT DEFAULT 1,
            price DECIMAL(10,2) NOT NULL,
            total DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id),
            FOREIGN KEY (service_id) REFERENCES services(id)
        )`,
        
        // Bảng admin_logs (nhật ký thao tác admin)
        `CREATE TABLE IF NOT EXISTS admin_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT NOT NULL,
            admin_name VARCHAR(100) NOT NULL,
            action VARCHAR(50) NOT NULL,
            target_type VARCHAR(50) NOT NULL,
            target_id INT NOT NULL,
            reason TEXT,
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES users(id)
        )`,
        
        // Bảng notifications
        `CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            type VARCHAR(50) NOT NULL,
            title VARCHAR(200) NOT NULL,
            message TEXT NOT NULL,
            booking_id INT NULL,
            feedback_id INT NULL,
            service_id INT NULL,
            for_customers BOOLEAN DEFAULT FALSE,
            read_status BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    ];
    
    for (const table of tables) {
        await pool.execute(table);
    }
    
    // Thêm một số phòng mẫu nếu chưa có
    await addSampleRoomsIfEmpty();
    console.log('✅ Cấu trúc database đã sẵn sàng!');
}



// Thêm phòng mẫu nếu bảng trống
async function addSampleRoomsIfEmpty() {
    try {
        const [existingRooms] = await pool.execute('SELECT COUNT(*) as count FROM rooms');
        if (existingRooms[0].count > 0) {
            console.log(`🏨 Đã có ${existingRooms[0].count} phòng trong hệ thống`);
            return;
        }
        
        console.log('🏨 Thêm phòng mẫu...');
        const sampleRooms = [
            // Phòng Đơn (5 phòng)
            ['101', 'Phòng Hoa Sen', 'Đơn', 500000, 1, '/images/phong-don.jpg', 'available'],
            ['102', 'Phòng Hoa Đào', 'Đơn', 500000, 1, '/images/phong-don.jpg', 'available'],
            ['103', 'Phòng Hoa Mai', 'Đơn', 500000, 1, '/images/phong-don.jpg', 'available'],
            ['104', 'Phòng Hoa Cúc', 'Đơn', 500000, 1, '/images/phong-don.jpg', 'available'],
            ['105', 'Phòng Hoa Hướng Dương', 'Đơn', 500000, 1, '/images/phong-don.jpg', 'available'],
            
            // Phòng Đôi (5 phòng)
            ['201', 'Phòng Biển Xanh', 'Đôi', 800000, 2, '/images/phong-doi.jpg', 'available'],
            ['202', 'Phòng Biển Bạc', 'Đôi', 800000, 2, '/images/phong-doi.jpg', 'available'],
            ['203', 'Phòng Biển Vàng', 'Đôi', 800000, 2, '/images/phong-doi.jpg', 'available'],
            ['204', 'Phòng Biển Ngọc', 'Đôi', 800000, 2, '/images/phong-doi.jpg', 'available'],
            ['205', 'Phòng Biển Hồng', 'Đôi', 800000, 2, '/images/phong-doi.jpg', 'available'],
            
            // Phòng Gia Đình (5 phòng)
            ['301', 'Phòng Gia Đình Hạnh Phúc', 'Gia Đình', 1200000, 4, '/images/phong-gia-dinh.jpg', 'available'],
            ['302', 'Phòng Gia Đình Yêu Thương', 'Gia Đình', 1200000, 4, '/images/phong-gia-dinh.jpg', 'available'],
            ['303', 'Phòng Gia Đình Ấm Áp', 'Gia Đình', 1200000, 4, '/images/phong-gia-dinh.jpg', 'available'],
            ['304', 'Phòng Gia Đình Bình An', 'Gia Đình', 1200000, 4, '/images/phong-gia-dinh.jpg', 'available'],
            ['305', 'Phòng Gia Đình Thịnh Vượng', 'Gia Đình', 1200000, 4, '/images/phong-gia-dinh.jpg', 'available'],
            
            // Phòng VIP (5 phòng)
            ['401', 'Phòng VIP Hoàng Gia', 'VIP', 2000000, 2, '/images/phong-vip.jpg', 'available'],
            ['402', 'Phòng VIP Tổng Thống', 'VIP', 2000000, 2, '/images/phong-vip.jpg', 'available'],
            ['403', 'Phòng VIP Hoàng Hậu', 'VIP', 2000000, 2, '/images/phong-vip.jpg', 'available'],
            ['404', 'Phòng VIP Thiên Đường', 'VIP', 2000000, 2, '/images/phong-vip.jpg', 'available'],
            ['405', 'Phòng VIP Kim Cương', 'VIP', 2000000, 2, '/images/phong-vip.jpg', 'available']
        ];
        
        for (const room of sampleRooms) {
            await pool.execute(
                'INSERT INTO rooms (number, name, type, price, capacity, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                room
            );
        }
        
        console.log(`✅ Đã thêm ${sampleRooms.length} phòng mẫu`);
        console.log('   - 5 phòng Đơn (101-105)');
        console.log('   - 5 phòng Đôi (201-205)');
        console.log('   - 5 phòng Gia Đình (301-305)');
        console.log('   - 5 phòng VIP (401-405)');
    } catch (error) {
        console.error('❌ Lỗi thêm phòng mẫu:', error.message);
    }
}

module.exports = {
    pool,
    testConnection,
    initDatabase
};