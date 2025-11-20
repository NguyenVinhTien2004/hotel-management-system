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

// Khởi tạo database và tables với phân quyền
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
        console.log('✅ Khởi tạo database với phân quyền thành công!');
    } catch (error) {
        console.error('❌ Lỗi khởi tạo database:', error.message);
    }
}

// Tạo các bảng với cải tiến phân quyền
async function createTables() {
    const tables = [
        // Bảng users với thêm trường phân quyền
        `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'staff', 'customer') DEFAULT 'customer',
            status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
            last_login TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_username (username),
            INDEX idx_email (email),
            INDEX idx_role (role)
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
            status ENUM('available', 'occupied', 'maintenance', 'cleaning') DEFAULT 'available',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_status (status),
            INDEX idx_type (type)
        )`,
        
        // Bảng customers
        `CREATE TABLE IF NOT EXISTS customers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) UNIQUE NOT NULL,
            email VARCHAR(100),
            address TEXT,
            id_number VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_phone (phone),
            INDEX idx_email (email)
        )`,
        
        // Bảng bookings với cải tiến
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
            payment_method ENUM('cash', 'card', 'transfer', 'online') DEFAULT 'cash',
            status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show') DEFAULT 'pending',
            notes TEXT,
            created_by INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id) REFERENCES rooms(id),
            FOREIGN KEY (created_by) REFERENCES users(id),
            INDEX idx_customer_name (customer_name),
            INDEX idx_customer_email (customer_email),
            INDEX idx_status (status),
            INDEX idx_check_in (check_in),
            INDEX idx_check_out (check_out)
        )`,
        
        // Bảng services
        `CREATE TABLE IF NOT EXISTS services (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            category VARCHAR(50) NOT NULL,
            description TEXT,
            status ENUM('active', 'inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_category (category),
            INDEX idx_status (status)
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
            status ENUM('pending', 'approved', 'hidden') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id),
            INDEX idx_booking_id (booking_id),
            INDEX idx_customer_name (customer_name),
            INDEX idx_status (status)
        )`,
        
        // Bảng invoices
        `CREATE TABLE IF NOT EXISTS invoices (
            id INT AUTO_INCREMENT PRIMARY KEY,
            booking_id INT NOT NULL,
            customer_name VARCHAR(100) NOT NULL,
            room_charges DECIMAL(10,2) NOT NULL,
            service_charges DECIMAL(10,2) DEFAULT 0,
            tax_amount DECIMAL(10,2) DEFAULT 0,
            discount_amount DECIMAL(10,2) DEFAULT 0,
            total_amount DECIMAL(10,2) NOT NULL,
            status ENUM('pending', 'paid', 'cancelled', 'refunded') DEFAULT 'pending',
            payment_date TIMESTAMP NULL,
            created_by INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id),
            FOREIGN KEY (created_by) REFERENCES users(id),
            INDEX idx_booking_id (booking_id),
            INDEX idx_status (status)
        )`,
        
        // Bảng invoice_services
        `CREATE TABLE IF NOT EXISTS invoice_services (
            id INT AUTO_INCREMENT PRIMARY KEY,
            invoice_id INT NOT NULL,
            service_id INT NOT NULL,
            service_name VARCHAR(100) NOT NULL,
            quantity INT DEFAULT 1,
            price DECIMAL(10,2) NOT NULL,
            total DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
            FOREIGN KEY (service_id) REFERENCES services(id),
            INDEX idx_invoice_id (invoice_id)
        )`,
        
        // Bảng admin_logs với cải tiến
        `CREATE TABLE IF NOT EXISTS admin_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT NOT NULL,
            admin_name VARCHAR(100) NOT NULL,
            action VARCHAR(50) NOT NULL,
            target_type VARCHAR(50) NOT NULL,
            target_id INT NOT NULL,
            reason TEXT,
            details TEXT,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES users(id),
            INDEX idx_admin_id (admin_id),
            INDEX idx_action (action),
            INDEX idx_target_type (target_type),
            INDEX idx_created_at (created_at)
        )`,
        
        // Bảng notifications với cải tiến
        `CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            type VARCHAR(50) NOT NULL,
            title VARCHAR(200) NOT NULL,
            message TEXT NOT NULL,
            booking_id INT NULL,
            feedback_id INT NULL,
            service_id INT NULL,
            user_id INT NULL,
            for_customers BOOLEAN DEFAULT FALSE,
            read_status BOOLEAN DEFAULT FALSE,
            priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
            expires_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id),
            FOREIGN KEY (feedback_id) REFERENCES feedback(id),
            FOREIGN KEY (service_id) REFERENCES services(id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            INDEX idx_user_id (user_id),
            INDEX idx_for_customers (for_customers),
            INDEX idx_read_status (read_status),
            INDEX idx_created_at (created_at)
        )`,

        // Bảng user_sessions để quản lý phiên đăng nhập
        `CREATE TABLE IF NOT EXISTS user_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token_hash VARCHAR(255) NOT NULL,
            ip_address VARCHAR(45),
            user_agent TEXT,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id),
            INDEX idx_token_hash (token_hash),
            INDEX idx_expires_at (expires_at)
        )`,

        // Bảng permission_logs để ghi log truy cập
        `CREATE TABLE IF NOT EXISTS permission_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            action VARCHAR(100) NOT NULL,
            resource VARCHAR(100) NOT NULL,
            resource_id INT NULL,
            allowed BOOLEAN NOT NULL,
            reason VARCHAR(255),
            ip_address VARCHAR(45),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            INDEX idx_user_id (user_id),
            INDEX idx_action (action),
            INDEX idx_allowed (allowed),
            INDEX idx_created_at (created_at)
        )`
    ];
    
    for (const table of tables) {
        await pool.execute(table);
    }
    
    // Thêm dữ liệu mẫu
    await addSampleData();
    console.log('✅ Cấu trúc database với phân quyền đã sẵn sàng!');
}

// Thêm dữ liệu mẫu
async function addSampleData() {
    try {
        // Thêm admin mặc định
        const [existingAdmin] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin']);
        if (existingAdmin[0].count === 0) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 12);
            
            await pool.execute(
                'INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
                ['admin', 'Administrator', 'admin@hotel.com', hashedPassword, 'admin']
            );
            console.log('✅ Tạo tài khoản admin mặc định: admin/admin123');
        }

        // Thêm staff mẫu
        const [existingStaff] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = ?', ['staff']);
        if (existingStaff[0].count === 0) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('staff123', 12);
            
            await pool.execute(
                'INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
                ['staff', 'Nhân viên', 'staff@hotel.com', hashedPassword, 'staff']
            );
            console.log('✅ Tạo tài khoản staff mặc định: staff/staff123');
        }

        // Thêm customer mẫu
        const [existingCustomer] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = ?', ['customer']);
        if (existingCustomer[0].count === 0) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('customer123', 12);
            
            await pool.execute(
                'INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
                ['customer', 'Khách hàng mẫu', 'customer@hotel.com', hashedPassword, 'customer']
            );
            console.log('✅ Tạo tài khoản customer mẫu: customer/customer123');
        }

        // Thêm phòng mẫu nếu chưa có
        await addSampleRoomsIfEmpty();
        
        // Thêm dịch vụ mẫu
        await addSampleServices();
        
    } catch (error) {
        console.error('❌ Lỗi thêm dữ liệu mẫu:', error.message);
    }
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
            ['101', 'Phòng Hoa Sen', 'Đơn', 500000, 1, '/images/phong-don/OIP.jfif', 'available'],
            ['102', 'Phòng Hoa Đào', 'Đơn', 500000, 1, '/images/phong-don/OIP.jfif', 'available'],
            ['103', 'Phòng Hoa Mai', 'Đơn', 500000, 1, '/images/phong-don/OIP.jfif', 'available'],
            ['104', 'Phòng Hoa Cúc', 'Đơn', 500000, 1, '/images/phong-don/OIP.jfif', 'available'],
            ['105', 'Phòng Hoa Hướng Dương', 'Đơn', 500000, 1, '/images/phong-don/OIP.jfif', 'available'],
            
            // Phòng Đôi (5 phòng)
            ['201', 'Phòng Biển Xanh', 'Đôi', 800000, 2, '/images/phong-doi/OIP.jfif', 'available'],
            ['202', 'Phòng Biển Bạc', 'Đôi', 800000, 2, '/images/phong-doi/OIP.jfif', 'available'],
            ['203', 'Phòng Biển Vàng', 'Đôi', 800000, 2, '/images/phong-doi/OIP.jfif', 'available'],
            ['204', 'Phòng Biển Ngọc', 'Đôi', 800000, 2, '/images/phong-doi/OIP.jfif', 'available'],
            ['205', 'Phòng Biển Hồng', 'Đôi', 800000, 2, '/images/phong-doi/OIP.jfif', 'available'],
            
            // Phòng Gia Đình (5 phòng)
            ['301', 'Phòng Gia Đình Hạnh Phúc', 'Gia Đình', 1200000, 4, '/images/phong-gia-dinh/OIP.jfif', 'available'],
            ['302', 'Phòng Gia Đình Yêu Thương', 'Gia Đình', 1200000, 4, '/images/phong-gia-dinh/OIP.jfif', 'available'],
            ['303', 'Phòng Gia Đình Ấm Áp', 'Gia Đình', 1200000, 4, '/images/phong-gia-dinh/OIP.jfif', 'available'],
            ['304', 'Phòng Gia Đình Bình An', 'Gia Đình', 1200000, 4, '/images/phong-gia-dinh/OIP.jfif', 'available'],
            ['305', 'Phòng Gia Đình Thịnh Vượng', 'Gia Đình', 1200000, 4, '/images/phong-gia-dinh/OIP.jfif', 'available'],
            
            // Phòng VIP (5 phòng)
            ['401', 'Phòng VIP Hoàng Gia', 'VIP', 2000000, 2, '/images/phong-vip/OIP.jfif', 'available'],
            ['402', 'Phòng VIP Tổng Thống', 'VIP', 2000000, 2, '/images/phong-vip/OIP.jfif', 'available'],
            ['403', 'Phòng VIP Hoàng Hậu', 'VIP', 2000000, 2, '/images/phong-vip/OIP.jfif', 'available'],
            ['404', 'Phòng VIP Thiên Đường', 'VIP', 2000000, 2, '/images/phong-vip/OIP.jfif', 'available'],
            ['405', 'Phòng VIP Kim Cương', 'VIP', 2000000, 2, '/images/phong-vip/OIP.jfif', 'available']
        ];
        
        for (const room of sampleRooms) {
            await pool.execute(
                'INSERT INTO rooms (number, name, type, price, capacity, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                room
            );
        }
        
        console.log(`✅ Đã thêm ${sampleRooms.length} phòng mẫu`);
    } catch (error) {
        console.error('❌ Lỗi thêm phòng mẫu:', error.message);
    }
}

// Thêm dịch vụ mẫu
async function addSampleServices() {
    try {
        const [existingServices] = await pool.execute('SELECT COUNT(*) as count FROM services');
        if (existingServices[0].count > 0) {
            return;
        }
        
        const sampleServices = [
            ['Dịch vụ giặt ủi', 50000, 'Giặt ủi', 'Dịch vụ giặt ủi quần áo'],
            ['Massage thư giãn', 300000, 'Spa', 'Dịch vụ massage thư giãn toàn thân'],
            ['Đưa đón sân bay', 200000, 'Vận chuyển', 'Dịch vụ đưa đón sân bay'],
            ['Ăn sáng buffet', 150000, 'Ăn uống', 'Buffet sáng đa dạng món ăn'],
            ['Thuê xe máy', 100000, 'Vận chuyển', 'Thuê xe máy theo ngày']
        ];
        
        for (const service of sampleServices) {
            await pool.execute(
                'INSERT INTO services (name, price, category, description) VALUES (?, ?, ?, ?)',
                service
            );
        }
        
        console.log(`✅ Đã thêm ${sampleServices.length} dịch vụ mẫu`);
    } catch (error) {
        console.error('❌ Lỗi thêm dịch vụ mẫu:', error.message);
    }
}

module.exports = {
    pool,
    testConnection,
    initDatabase
};