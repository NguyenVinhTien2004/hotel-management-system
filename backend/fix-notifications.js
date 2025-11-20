const mysql = require('mysql2/promise');

async function fixNotifications() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '123456789@',
            database: 'quanlykhachsan',
            port: 3306
        });
        
        // Tạo bảng notifications nếu chưa có
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS notifications (
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
            )
        `);
        
        console.log('✅ Bảng notifications đã được tạo/cập nhật');
        await connection.end();
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    }
}

fixNotifications();