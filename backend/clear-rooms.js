const { pool } = require('./database');

async function clearRooms() {
    try {
        console.log('🔄 Đang xóa tất cả dữ liệu trong bảng rooms...');
        
        // Tắt kiểm tra foreign key
        await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        // Xóa tất cả dữ liệu
        await pool.execute('DELETE FROM rooms');
        
        // Reset AUTO_INCREMENT
        await pool.execute('ALTER TABLE rooms AUTO_INCREMENT = 1');
        
        // Bật lại kiểm tra foreign key
        await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
        
        // Kiểm tra kết quả
        const [result] = await pool.execute('SELECT COUNT(*) as total FROM rooms');
        
        console.log('✅ Xóa thành công!');
        console.log(`📊 Số phòng còn lại: ${result[0].total}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

clearRooms();