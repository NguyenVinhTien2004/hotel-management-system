const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, testConnection, initDatabase } = require('./database');

// Import middleware và routes
const { 
    authenticateToken, 
    requireAdmin, 
    requireStaff, 
    requireCustomer,
    requireOwnership,
    checkPermission,
    writeActivityLog
} = require('./middleware/auth');

const { 
    checkResourcePermission,
    checkRoutePermission 
} = require('./middleware/permissions');

const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Serve static files
app.use('/images', express.static(path.join(__dirname, '../frontend-20251108T081940Z-1-001/frontend/images')));
app.use(express.static(path.join(__dirname, '../frontend-20251108T081940Z-1-001/frontend')));

// Auth routes
app.use('/api/auth', authRoutes);

// Function to get room image
function getRoomImage(roomType) {
    const imageMap = {
        'Đơn': '/images/phong-don/OIP.jfif',
        'Đôi': '/images/phong-doi/OIP.jfif', 
        'Gia Đình': '/images/phong-gia-dinh/OIP.jfif',
        'VIP': '/images/phong-vip/OIP.jfif'
    };
    return imageMap[roomType] || '/images/placeholder.jpg';
}

// Dashboard stats - Phân quyền theo vai trò
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        
        if (user.role === 'admin' || user.role === 'staff') {
            // Stats cho admin/staff
            const [customers] = await pool.execute('SELECT COUNT(*) as count FROM customers');
            const [bookings] = await pool.execute("SELECT COUNT(*) as count FROM bookings WHERE status IN ('confirmed', 'checked_in')");
            const [revenue] = await pool.execute("SELECT SUM(total_amount) as total FROM bookings WHERE status = 'checked_out'");
            const [rooms] = await pool.execute("SELECT COUNT(*) as count FROM rooms WHERE status = 'available'");

            res.json({
                success: true,
                data: {
                    totalCustomers: customers[0].count,
                    bookedRooms: bookings[0].count,
                    revenue: revenue[0].total || 0,
                    availableRooms: rooms[0].count
                }
            });
        } else {
            // Stats cho customer
            const [myBookings] = await pool.execute(
                'SELECT COUNT(*) as count FROM bookings WHERE customer_name = ? OR customer_email = ?',
                [user.name, user.email]
            );
            const [myFeedbacks] = await pool.execute(
                'SELECT COUNT(*) as count FROM feedback WHERE customer_name = ?',
                [user.name]
            );
            const [availableRooms] = await pool.execute("SELECT COUNT(*) as count FROM rooms WHERE status = 'available'");
            const [totalServices] = await pool.execute('SELECT COUNT(*) as count FROM services');

            res.json({
                success: true,
                data: {
                    myBookings: myBookings[0].count,
                    myFeedbacks: myFeedbacks[0].count,
                    availableRooms: availableRooms[0].count,
                    totalServices: totalServices[0].count
                }
            });
        }
    } catch (error) {
        console.error('Lỗi lấy thống kê:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ROOMS ROUTES
// Xem danh sách phòng - Tất cả vai trò
app.get('/api/rooms', authenticateToken, checkResourcePermission('rooms', 'read'), async (req, res) => {
    try {
        const { status, type } = req.query;
        let query = 'SELECT * FROM rooms';
        let params = [];
        
        if (status || type) {
            query += ' WHERE ';
            const conditions = [];
            
            if (status) {
                conditions.push('status = ?');
                params.push(status);
            }
            
            if (type) {
                conditions.push('type = ?');
                params.push(type);
            }
            
            query += conditions.join(' AND ');
        }
        
        const [rooms] = await pool.execute(query, params);
        
        const roomsWithImages = rooms.map(room => ({
            ...room,
            image: getRoomImage(room.type)
        }));
        
        res.json({ success: true, rooms: roomsWithImages });
    } catch (error) {
        console.error('Lỗi lấy danh sách phòng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Tạo phòng mới - Chỉ admin
app.post('/api/rooms', authenticateToken, requireAdmin, checkResourcePermission('rooms', 'create'), async (req, res) => {
    try {
        const { number, name, type, price, capacity } = req.body;
        
        const [existing] = await pool.execute('SELECT id FROM rooms WHERE number = ?', [number]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Số phòng đã tồn tại' });
        }

        const [result] = await pool.execute(
            'INSERT INTO rooms (number, name, type, price, capacity, status) VALUES (?, ?, ?, ?, ?, ?)',
            [number, name || `Phòng ${number}`, type, parseInt(price), parseInt(capacity), 'available']
        );

        await writeActivityLog(req, result.insertId, 'Thêm phòng mới', `Thêm phòng ${number} - ${type} - ${price}`);

        res.status(201).json({ success: true, message: 'Tạo phòng thành công', roomId: result.insertId });
    } catch (error) {
        console.error('Lỗi tạo phòng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Cập nhật trạng thái phòng - Admin và Staff
app.put('/api/rooms/:id/status', authenticateToken, requireStaff, checkResourcePermission('rooms', 'changeStatus'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['available', 'occupied', 'maintenance'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
        }
        
        await pool.execute('UPDATE rooms SET status = ? WHERE id = ?', [status, id]);
        await writeActivityLog(req, id, 'Cập nhật trạng thái phòng', `Đổi trạng thái phòng thành ${status}`);
        
        res.json({ success: true, message: 'Cập nhật trạng thái phòng thành công' });
    } catch (error) {
        console.error('Lỗi cập nhật trạng thái phòng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Xóa phòng - Chỉ admin
app.delete('/api/rooms/:id', authenticateToken, requireAdmin, checkResourcePermission('rooms', 'delete'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rooms] = await pool.execute('SELECT * FROM rooms WHERE id = ?', [id]);
        const room = rooms[0];
        
        await pool.execute('DELETE FROM rooms WHERE id = ?', [id]);
        
        if (room) {
            await writeActivityLog(req, id, 'Xóa phòng', `Xóa phòng ${room.number} - ${room.type}`);
        }
        
        res.json({ success: true, message: 'Xóa phòng thành công' });
    } catch (error) {
        console.error('Lỗi xóa phòng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// BOOKINGS ROUTES
// Xem danh sách đặt phòng - Phân quyền theo vai trò
app.get('/api/bookings', authenticateToken, checkResourcePermission('bookings', 'read'), async (req, res) => {
    try {
        const user = req.user;
        
        if (user.role === 'admin' || user.role === 'staff') {
            // Admin/Staff xem tất cả
            const [bookings] = await pool.execute('SELECT * FROM bookings ORDER BY created_at DESC');
            res.json({ success: true, bookings });
        } else {
            // Customer chỉ xem của mình
            const [bookings] = await pool.execute(
                'SELECT * FROM bookings WHERE customer_name = ? OR customer_email = ? ORDER BY created_at DESC',
                [user.name, user.email]
            );
            res.json({ success: true, bookings });
        }
    } catch (error) {
        console.error('Lỗi lấy danh sách đặt phòng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Tạo đặt phòng - Tất cả vai trò
app.post('/api/bookings', authenticateToken, checkResourcePermission('bookings', 'create'), async (req, res) => {
    try {
        const { customer_name, customer_phone, customer_email, room_id, check_in, check_out, guest_count, payment_method } = req.body;
        
        const [rooms] = await pool.execute('SELECT * FROM rooms WHERE id = ?', [room_id]);
        if (rooms.length === 0) {
            return res.status(404).json({ success: false, message: 'Phòng không tồn tại' });
        }
        
        const room = rooms[0];
        if (room.status !== 'available') {
            return res.status(400).json({ success: false, message: 'Phòng không có sẵn' });
        }
        
        const checkInDate = new Date(check_in);
        const checkOutDate = new Date(check_out);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (checkInDate < today) {
            return res.status(400).json({ success: false, message: 'Ngày nhận phòng không thể là quá khứ' });
        }
        
        if (checkOutDate <= checkInDate) {
            return res.status(400).json({ success: false, message: 'Ngày trả phòng phải sau ngày nhận phòng' });
        }
        
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalAmount = room.price * nights;

        const [result] = await pool.execute(
            'INSERT INTO bookings (customer_name, customer_phone, customer_email, room_id, room_number, room_name, room_type, check_in, check_out, guest_count, total_amount, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [customer_name, customer_phone, customer_email, room_id, room.number, room.name, room.type, check_in, check_out, guest_count, totalAmount, payment_method || 'cash', 'pending']
        );
        
        await pool.execute('UPDATE rooms SET status = ? WHERE id = ?', ['occupied', room_id]);
        
        // Add customer if not exists
        const [existingCustomer] = await pool.execute('SELECT id FROM customers WHERE phone = ?', [customer_phone]);
        if (existingCustomer.length === 0) {
            await pool.execute(
                'INSERT INTO customers (name, phone, email, address, id_number) VALUES (?, ?, ?, ?, ?)',
                [customer_name, customer_phone, customer_email, '', '']
            );
        }
        
        res.status(201).json({ success: true, message: 'Đặt phòng thành công!', bookingId: result.insertId });
    } catch (error) {
        console.error('Lỗi đặt phòng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Cập nhật trạng thái đặt phòng - Phân quyền theo vai trò và sở hữu
app.put('/api/bookings/:id/status', authenticateToken, requireOwnership('booking'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = req.user;

        const [bookings] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [id]);
        if (bookings.length === 0) {
            return res.status(404).json({ success: false, message: 'Đặt phòng không tồn tại' });
        }
        
        const booking = bookings[0];

        // Customer chỉ được hủy đặt phòng của mình
        if (user.role === 'customer' && status !== 'cancelled') {
            return res.status(403).json({ success: false, message: 'Khách hàng chỉ có thể hủy đặt phòng' });
        }

        await pool.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

        if (status === 'cancelled' || status === 'checked_out') {
            await pool.execute('UPDATE rooms SET status = ? WHERE id = ?', ['available', booking.room_id]);
        }

        // Tự động tạo hóa đơn khi trả phòng
        if (status === 'checked_out') {
            try {
                await pool.execute(
                    'INSERT INTO invoices (booking_id, customer_name, room_charges, service_charges, total_amount, status) VALUES (?, ?, ?, ?, ?, ?)',
                    [booking.id, booking.customer_name, booking.total_amount, 0, booking.total_amount, 'paid']
                );
            } catch (invoiceError) {
                console.error('Lỗi tạo hóa đơn:', invoiceError);
            }
        }

        if (user.role === 'admin' || user.role === 'staff') {
            const statusText = {
                'confirmed': 'xác nhận',
                'checked_in': 'nhận phòng', 
                'checked_out': 'trả phòng',
                'cancelled': 'hủy'
            };
            
            await writeActivityLog(
                req,
                id,
                `Cập nhật trạng thái đặt phòng`,
                `${statusText[status] || status} đặt phòng #${id} - Khách: ${booking.customer_name} - Phòng: ${booking.room_number}`
            );
        }
        
        res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
        console.error('Lỗi cập nhật trạng thái đặt phòng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// SERVICES ROUTES
// Xem danh sách dịch vụ - Tất cả vai trò
app.get('/api/services', authenticateToken, checkResourcePermission('services', 'read'), async (req, res) => {
    try {
        const [services] = await pool.execute('SELECT * FROM services ORDER BY created_at DESC');
        res.json({ success: true, services });
    } catch (error) {
        console.error('Lỗi lấy danh sách dịch vụ:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Tạo dịch vụ mới - Chỉ admin
app.post('/api/services', authenticateToken, requireAdmin, checkResourcePermission('services', 'create'), async (req, res) => {
    try {
        const { name, price, category, description } = req.body;
        
        const [result] = await pool.execute(
            'INSERT INTO services (name, price, category, description) VALUES (?, ?, ?, ?)',
            [name, parseInt(price), category, description]
        );
        
        await writeActivityLog(req, result.insertId, 'Thêm dịch vụ mới', `Thêm dịch vụ ${name} - ${price}`);
        
        res.status(201).json({ success: true, message: 'Thêm dịch vụ thành công', serviceId: result.insertId });
    } catch (error) {
        console.error('Lỗi tạo dịch vụ:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// FEEDBACK ROUTES
// Tạo feedback - Chỉ customer
app.post('/api/feedback', authenticateToken, requireCustomer, async (req, res) => {
    try {
        const { booking_id, room_rating, service_rating, comment } = req.body;
        
        const [bookings] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [booking_id]);
        if (bookings.length === 0) {
            return res.status(404).json({ success: false, message: 'Đặt phòng không tồn tại' });
        }
        
        const booking = bookings[0];
        
        // Kiểm tra khách hàng có quyền đánh giá không
        if (booking.customer_name !== req.user.name && booking.customer_email !== req.user.email) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền đánh giá đặt phòng này' });
        }
        
        const [existing] = await pool.execute('SELECT id FROM feedback WHERE booking_id = ?', [booking_id]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Bạn đã đánh giá cho đặt phòng này rồi' });
        }
        
        await pool.execute(
            'INSERT INTO feedback (booking_id, customer_name, room_number, room_name, room_rating, service_rating, comment, check_in, check_out) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [booking_id, booking.customer_name, booking.room_number, booking.room_name, room_rating, service_rating, comment || '', booking.check_in, booking.check_out]
        );
        
        res.status(201).json({ success: true, message: 'Cảm ơn bạn đã đánh giá!' });
    } catch (error) {
        console.error('Lỗi tạo feedback:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Xem feedback - Admin và Staff
app.get('/api/admin/feedback', authenticateToken, requireStaff, async (req, res) => {
    try {
        const [feedback] = await pool.execute('SELECT * FROM feedback ORDER BY created_at DESC');
        res.json({ success: true, feedback });
    } catch (error) {
        console.error('Lỗi lấy feedback:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Start server
async function startServer() {
    try {
        console.log('🔄 Đang kết nối MySQL...');
        await testConnection();
        
        console.log('🔄 Đang khởi tạo database...');
        await initDatabase();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server đang chạy trên port ${PORT}`);
            console.log('✅ Sử dụng MySQL database với hệ thống phân quyền');
            console.log('🔐 Phân quyền:');
            console.log('   - Admin: Toàn quyền');
            console.log('   - Staff: Hạn chế một số quyền');
            console.log('   - Customer: Chỉ quản lý dữ liệu của mình');
        });
    } catch (error) {
        console.error('❌ Lỗi khởi động server:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;