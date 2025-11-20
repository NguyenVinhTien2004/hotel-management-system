const { pool } = require('./database-mysql-only');

async function fixServicePrices() {
    try {
        console.log('🔄 Đang kiểm tra và sửa giá dịch vụ...');
        
        // Lấy tất cả dịch vụ hiện tại
        const [services] = await pool.execute('SELECT * FROM services');
        console.log('📋 Tìm thấy', services.length, 'dịch vụ:');
        
        for (const service of services) {
            console.log(`- ${service.name}: ${service.price} VND`);
        }
        
        // Cập nhật giá dịch vụ nếu cần (sử dụng ID để an toàn)
        for (const service of services) {
            if (service.price < 1000) {
                let correctPrice = 50000; // Giá mặc định
                
                // Xác định giá đúng cho từng dịch vụ
                if (service.name.toLowerCase().includes('massage')) {
                    correctPrice = 200000;
                } else if (service.name.toLowerCase().includes('sân bay') || service.name.toLowerCase().includes('xe')) {
                    correctPrice = 300000;
                } else if (service.name.toLowerCase().includes('phòng')) {
                    correctPrice = 100000;
                } else if (service.name.toLowerCase().includes('gym')) {
                    correctPrice = 200000;
                }
                
                console.log(`🔧 Cập nhật giá ${service.name} (ID: ${service.id}) từ ${service.price} thành ${correctPrice}`);
                await pool.execute(
                    'UPDATE services SET price = ? WHERE id = ?',
                    [correctPrice, service.id]
                );
            }
        }
        
        // Thêm dịch vụ bơi lội nếu chưa có
        const hasSwimming = services.some(s => s.name.toLowerCase().includes('bơi'));
        if (!hasSwimming) {
            console.log('🏆 Thêm dịch vụ bơi lội mới');
            await pool.execute(
                'INSERT INTO services (name, price, category, description) VALUES (?, ?, ?, ?)',
                ['Bơi lội', 50000, 'other', 'Sử dụng hồ bơi khách sạn']
            );
        }
        
        // Hiển thị kết quả sau khi cập nhật
        const [updatedServices] = await pool.execute('SELECT * FROM services');
        console.log('\n✅ Giá dịch vụ sau khi cập nhật:');
        for (const service of updatedServices) {
            console.log(`- ${service.name}: ${service.price.toLocaleString('vi-VN')} VND`);
        }
        
        console.log('\n✅ Hoàn thành cập nhật giá dịch vụ!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

fixServicePrices();