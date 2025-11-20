const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool, testConnection, initDatabase } = require('./database');

const DATA_FILE = path.join(__dirname, 'data.json');

async function migrateData() {
    try {
        console.log('🚀 Bắt đầu migrate dữ liệu từ JSON sang MySQL...');
        
        // Kiểm tra kết nối và khởi tạo database
        await testConnection();
        await initDatabase();
        
        // Đọc dữ liệu từ JSON
        if (!fs.existsSync(DATA_FILE)) {
            console.log('❌ Không tìm thấy file data.json');
            return;
        }
        
        const jsonData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        console.log('✅ Đã đọc dữ liệu từ JSON');
        
        // Xóa dữ liệu cũ (nếu có)
        console.log('🗑️ Xóa dữ liệu cũ...');
        await pool.execute('DELETE FROM feedback');
        await pool.execute('DELETE FROM invoice_services');
        await pool.execute('DELETE FROM invoices');
        await pool.execute('DELETE FROM bookings');
        await pool.execute('DELETE FROM customers');
        await pool.execute('DELETE FROM services');
        await pool.execute('DELETE FROM rooms');
        await pool.execute('DELETE FROM users');
        
        // Reset AUTO_INCREMENT
        await pool.execute('ALTER TABLE users AUTO_INCREMENT = 1');
        await pool.execute('ALTER TABLE rooms AUTO_INCREMENT = 1');
        await pool.execute('ALTER TABLE customers AUTO_INCREMENT = 1');
        await pool.execute('ALTER TABLE bookings AUTO_INCREMENT = 1');
        await pool.execute('ALTER TABLE services AUTO_INCREMENT = 1');
        await pool.execute('ALTER TABLE feedback AUTO_INCREMENT = 1');
        await pool.execute('ALTER TABLE invoices AUTO_INCREMENT = 1');
        
        // Migrate Users
        console.log('👥 Migrate users...');
        for (const user of jsonData.users) {
            await pool.execute(
                'INSERT INTO users (id, username, name, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
                [user.id, user.username, user.name, user.email, user.password, user.role]
            );
        }
        console.log(`✅ Đã migrate ${jsonData.users.length} users`);
        
        // Migrate Rooms
        console.log('🏨 Migrate rooms...');
        for (const room of jsonData.rooms) {
            await pool.execute(
                'INSERT INTO rooms (id, number, name, type, price, capacity, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [room.id, room.number, room.name, room.type, room.price, room.capacity, room.status]
            );
        }
        console.log(`✅ Đã migrate ${jsonData.rooms.length} rooms`);
        
        // Migrate Customers
        console.log('👤 Migrate customers...');
        for (const customer of jsonData.customers) {
            await pool.execute(
                'INSERT INTO customers (id, name, phone, email, address, id_number) VALUES (?, ?, ?, ?, ?, ?)',
                [customer.id, customer.name, customer.phone, customer.email, customer.address || '', customer.id_number || '']
            );
        }
        console.log(`✅ Đã migrate ${jsonData.customers.length} customers`);
        
        // Migrate Services
        console.log('🛎️ Migrate services...');
        for (const service of jsonData.services) {
            await pool.execute(
                'INSERT INTO services (id, name, price, category, description) VALUES (?, ?, ?, ?, ?)',
                [service.id, service.name, service.price, service.category, service.description || '']
            );
        }
        console.log(`✅ Đã migrate ${jsonData.services.length} services`);
        
        // Migrate Bookings
        console.log('📅 Migrate bookings...');
        for (const booking of jsonData.bookings) {
            await pool.execute(
                'INSERT INTO bookings (id, customer_name, customer_phone, customer_email, room_id, room_number, room_name, room_type, check_in, check_out, guest_count, total_amount, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    booking.id,
                    booking.customer_name,
                    booking.customer_phone || '',
                    booking.customer_email,
                    booking.room_id,
                    booking.room_number,
                    booking.room_name || '',
                    booking.room_type || '',
                    booking.check_in,
                    booking.check_out,
                    booking.guest_count,
                    booking.total_amount,
                    booking.payment_method || 'cash',
                    booking.status
                ]
            );
        }
        console.log(`✅ Đã migrate ${jsonData.bookings.length} bookings`);
        
        // Migrate Invoices
        if (jsonData.invoices && jsonData.invoices.length > 0) {
            console.log('🧾 Migrate invoices...');
            for (const invoice of jsonData.invoices) {
                await pool.execute(
                    'INSERT INTO invoices (id, booking_id, customer_name, room_charges, service_charges, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [
                        invoice.id,
                        invoice.booking_id,
                        invoice.customer_name,
                        invoice.room_charges,
                        invoice.service_charges || 0,
                        invoice.total_amount,
                        invoice.status
                    ]
                );
                
                // Migrate invoice services nếu có
                if (invoice.services && invoice.services.length > 0) {
                    for (const service of invoice.services) {
                        await pool.execute(
                            'INSERT INTO invoice_services (invoice_id, service_id, service_name, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?)',
                            [invoice.id, service.service_id, service.service_name, service.quantity, service.price, service.total]
                        );
                    }
                }
            }
            console.log(`✅ Đã migrate ${jsonData.invoices.length} invoices`);
        }
        
        // Reset AUTO_INCREMENT để tiếp tục từ ID cao nhất
        const maxIds = await Promise.all([
            pool.execute('SELECT MAX(id) as max_id FROM users'),
            pool.execute('SELECT MAX(id) as max_id FROM rooms'),
            pool.execute('SELECT MAX(id) as max_id FROM customers'),
            pool.execute('SELECT MAX(id) as max_id FROM bookings'),
            pool.execute('SELECT MAX(id) as max_id FROM services'),
            pool.execute('SELECT MAX(id) as max_id FROM invoices')
        ]);
        
        const tables = ['users', 'rooms', 'customers', 'bookings', 'services', 'invoices'];
        for (let i = 0; i < tables.length; i++) {
            const maxId = maxIds[i][0][0].max_id || 0;
            await pool.execute(`ALTER TABLE ${tables[i]} AUTO_INCREMENT = ${maxId + 1}`);
        }
        
        console.log('🎉 Migration hoàn thành!');
        console.log('📊 Thống kê:');
        console.log(`   - Users: ${jsonData.users.length}`);
        console.log(`   - Rooms: ${jsonData.rooms.length}`);
        console.log(`   - Customers: ${jsonData.customers.length}`);
        console.log(`   - Services: ${jsonData.services.length}`);
        console.log(`   - Bookings: ${jsonData.bookings.length}`);
        console.log(`   - Invoices: ${jsonData.invoices ? jsonData.invoices.length : 0}`);
        
        // Backup file JSON
        const backupFile = path.join(__dirname, `data-backup-${Date.now()}.json`);
        fs.copyFileSync(DATA_FILE, backupFile);
        console.log(`💾 Đã backup file JSON thành: ${path.basename(backupFile)}`);
        
    } catch (error) {
        console.error('❌ Lỗi migration:', error);
    } finally {
        process.exit(0);
    }
}

// Chạy migration
migrateData();