const mysql = require('mysql2/promise');

async function testSimple() {
    try {
        console.log('🔄 Đang test kết nối MySQL...');
        
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '123456789@',
            database: 'quanlykhachsan',
            port: 3306
        });
        
        console.log('✅ Kết nối MySQL thành công!');
        
        // Test query đơn giản
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Query test thành công:', rows);
        
        // Kiểm tra bảng rooms
        try {
            const [rooms] = await connection.execute('SELECT COUNT(*) as count FROM rooms');
            console.log('✅ Bảng rooms có', rooms[0].count, 'phòng');
        } catch (error) {
            console.log('❌ Lỗi truy vấn bảng rooms:', error.message);
        }
        
        await connection.end();
        console.log('✅ Test hoàn thành!');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.log('💡 Kiểm tra:');
        console.log('   - MySQL đã chạy chưa?');
        console.log('   - Mật khẩu root có đúng là "123456789@"?');
        console.log('   - Database "quanlykhachsan" đã tồn tại chưa?');
    }
}

testSimple();