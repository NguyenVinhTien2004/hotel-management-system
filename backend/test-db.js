const mysql = require('mysql2/promise');

async function testDB() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '123456789@',
            database: 'quanlykhachsan',
            port: 3306
        });
        
        console.log('✅ Kết nối MySQL thành công!');
        
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM rooms');
        console.log(`📊 Có ${rows[0].count} phòng trong database`);
        
        await connection.end();
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    }
}

testDB();