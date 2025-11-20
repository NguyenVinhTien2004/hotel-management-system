const { pool } = require('./database-mysql-only');

async function fixRoomPrices() {
    try {
        console.log('🔄 Đang kiểm tra và sửa giá phòng...');
        
        // Lấy tất cả phòng hiện tại
        const [rooms] = await pool.execute('SELECT * FROM rooms ORDER BY number');
        console.log('📋 Tìm thấy', rooms.length, 'phòng:');
        
        for (const room of rooms) {
            console.log(`- ${room.number}: ${room.name} (${room.type}) - ${room.price} VND`);
        }
        
        // Cập nhật giá phòng đúng
        console.log('\n🔧 Cập nhật giá phòng...');
        
        // Phòng Đơn: 500,000 VND
        await pool.execute("UPDATE rooms SET price = 500000 WHERE type = 'Đơn'");
        console.log('✅ Cập nhật phòng Đơn: 500,000 VND');
        
        // Phòng Đôi: 800,000 VND  
        await pool.execute("UPDATE rooms SET price = 800000 WHERE type = 'Đôi'");
        console.log('✅ Cập nhật phòng Đôi: 800,000 VND');
        
        // Phòng Gia Đình: 1,200,000 VND
        await pool.execute("UPDATE rooms SET price = 1200000 WHERE type = 'Gia Đình'");
        console.log('✅ Cập nhật phòng Gia Đình: 1,200,000 VND');
        
        // Phòng VIP: 2,000,000 VND
        await pool.execute("UPDATE rooms SET price = 2000000 WHERE type = 'VIP'");
        console.log('✅ Cập nhật phòng VIP: 2,000,000 VND');
        
        // Hiển thị kết quả sau khi cập nhật
        const [updatedRooms] = await pool.execute('SELECT * FROM rooms ORDER BY number');
        console.log('\n✅ Giá phòng sau khi cập nhật:');
        for (const room of updatedRooms) {
            console.log(`- ${room.number}: ${room.name} (${room.type}) - ${room.price.toLocaleString('vi-VN')} VND`);
        }
        
        console.log('\n✅ Hoàn thành cập nhật giá phòng!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

fixRoomPrices();