// Auto setup database on first run
const mysql = require('mysql2/promise');

async function initDatabase() {
    if (!process.env.DATABASE_URL) {
        console.log('No DATABASE_URL found, skipping cloud init');
        return;
    }
    
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        
        // Create tables
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS rooms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                number VARCHAR(10) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                type VARCHAR(50) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                capacity INT NOT NULL,
                status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
                image VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Insert sample rooms
        await connection.execute(`
            INSERT IGNORE INTO rooms (number, name, type, price, capacity, status) VALUES
            ('101', 'Phòng Deluxe', 'Đơn', 500000, 2, 'available'),
            ('102', 'Phòng Superior', 'Đôi', 800000, 4, 'available'),
            ('201', 'Phòng Family', 'Gia Đình', 1200000, 6, 'available'),
            ('301', 'Phòng VIP', 'VIP', 2000000, 2, 'available')
        `);
        
        // Create other tables...
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                category VARCHAR(50),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await connection.execute(`
            INSERT IGNORE INTO services (name, price, category, description) VALUES
            ('Giặt ủi', 50000, 'laundry', 'Dịch vụ giặt ủi chuyên nghiệp'),
            ('Massage', 200000, 'spa', 'Dịch vụ massage thư giãn'),
            ('Xe đưa đón sân bay', 300000, 'transport', 'Đưa đón từ/đến sân bay')
        `);
        
        console.log('✅ Database initialized successfully');
        await connection.end();
    } catch (error) {
        console.error('❌ Database init error:', error);
    }
}

module.exports = { initDatabase };