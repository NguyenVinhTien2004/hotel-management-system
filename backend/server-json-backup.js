const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool, testConnection, initDatabase } = require('./database');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'hotel-secret-key';

app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Middleware kiểm tra quyền admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    next();
};

// Auth routes
app.post('/api/auth/admin-login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (password !== '@') {
            return res.status(401).json({ message: 'Mật khẩu không đúng' });
        }
        
        const token = jwt.sign(
            { id: 1, username: username, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: 1,
                username: username,
                name: username,
                email: `${username}@hotel.com`,
                role: 'admin'
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, name, email, password } = req.body;
        
        // Kiểm tra user đã tồn tại
        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.execute(
            'INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [username, name, email, hashedPassword, 'customer']
        );
        
        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Dashboard stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        
        if (user.role === 'admin' || user.role === 'staff') {
            const [customers] = await pool.execute('SELECT COUNT(*) as count FROM customers');
            const [bookings] = await pool.execute("SELECT COUNT(*) as count FROM bookings WHERE status IN ('confirmed', 'checked_in')");
            const [revenue] = await pool.execute("SELECT SUM(total_amount) as total FROM bookings WHERE status = 'checked_out'");
            const [rooms] = await pool.execute("SELECT COUNT(*) as count FROM rooms WHERE status = 'available'");

            res.json({
                totalCustomers: customers[0].count,
                bookedRooms: bookings[0].count,
                revenue: revenue[0].total || 0,
                availableRooms: rooms[0].count
            });
        } else {
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
                myBookings: myBookings[0].count,
                myFeedbacks: myFeedbacks[0].count,
                availableRooms: availableRooms[0].count,
                totalServices: totalServices[0].count
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Rooms routes
app.get('/api/rooms', authenticateToken, async (req, res) => {
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
        res.json({ rooms });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/rooms', authenticateToken, async (req, res) => {
    try {
        const { number, name, type, price, capacity } = req.body;
        
        const [existing] = await pool.execute('SELECT id FROM rooms WHERE number = ?', [number]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Room number already exists' });
        }

        const [result] = await pool.execute(
            'INSERT INTO rooms (number, name, type, price, capacity, status) VALUES (?, ?, ?, ?, ?, ?)',
            [number, name || `Phòng ${number}`, type, parseInt(price), parseInt(capacity), 'available']
        );

        res.status(201).json({ message: 'Room created successfully', roomId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/rooms/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['available', 'occupied', 'maintenance'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }
        
        await pool.execute('UPDATE rooms SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Cập nhật trạng thái phòng thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Bookings routes
app.get('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        
        if (user.role === 'admin' || user.role === 'staff') {
            const [bookings] = await pool.execute('SELECT * FROM bookings ORDER BY created_at DESC');
            res.json({ bookings });
        } else {
            const [bookings] = await pool.execute(
                'SELECT * FROM bookings WHERE customer_name = ? OR customer_email = ? ORDER BY created_at DESC',
                [user.name, user.email]
            );
            res.json({ bookings });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const { customer_name, customer_phone, customer_email, room_id, check_in, check_out, guest_count, payment_method } = req.body;
        
        const [rooms] = await pool.execute('SELECT * FROM rooms WHERE id = ?', [room_id]);
        if (rooms.length === 0) {
            return res.status(404).json({ message: 'Phòng không tồn tại' });
        }
        
        const room = rooms[0];
        if (room.status !== 'available') {
            return res.status(400).json({ message: 'Phòng không có sẵn' });
        }
        
        const checkInDate = new Date(check_in);
        const checkOutDate = new Date(check_out);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (checkInDate < today) {
            return res.status(400).json({ message: 'Ngày nhận phòng không thể là quá khứ' });
        }
        
        if (checkOutDate <= checkInDate) {
            return res.status(400).json({ message: 'Ngày trả phòng phải sau ngày nhận phòng' });
        }
        
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalAmount = room.price * nights;

        const [result] = await pool.execute(
            'INSERT INTO bookings (customer_name, customer_phone, customer_email, room_id, room_number, room_name, room_type, check_in, check_out, guest_count, total_amount, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [customer_name, customer_phone, customer_email, room_id, room.number, room.name, room.type, check_in, check_out, guest_count, totalAmount, payment_method || 'cash', 'pending']
        );
        
        // Update room status
        await pool.execute('UPDATE rooms SET status = ? WHERE id = ?', ['occupied', room_id]);
        
        // Add customer if not exists
        const [existingCustomer] = await pool.execute('SELECT id FROM customers WHERE phone = ?', [customer_phone]);
        if (existingCustomer.length === 0) {
            await pool.execute(
                'INSERT INTO customers (name, phone, email, address, id_number) VALUES (?, ?, ?, ?, ?)',
                [customer_name, customer_phone, customer_email, '', '']
            );
        }

        res.status(201).json({ message: 'Đặt phòng thành công! Vui lòng chờ xác nhận từ nhân viên.', bookingId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/bookings/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = req.user;

        const [bookings] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [id]);
        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        const booking = bookings[0];

        if (user.role !== 'admin' && user.role !== 'staff') {
            if (status !== 'cancelled' || 
                (booking.customer_name !== user.name && booking.customer_email !== user.email)) {
                return res.status(403).json({ message: 'Không có quyền thực hiện' });
            }
        }

        await pool.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

        if (status === 'cancelled' || status === 'checked_out') {
            await pool.execute('UPDATE rooms SET status = ? WHERE id = ?', ['available', booking.room_id]);
        }

        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Customers routes
app.get('/api/customers', authenticateToken, async (req, res) => {
    try {
        const [customers] = await pool.execute('SELECT * FROM customers ORDER BY created_at DESC');
        res.json({ customers });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Services routes
app.get('/api/services', authenticateToken, async (req, res) => {
    try {
        const [services] = await pool.execute('SELECT * FROM services ORDER BY created_at DESC');
        res.json({ services });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/services', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, price, category, description } = req.body;
        
        const [result] = await pool.execute(
            'INSERT INTO services (name, price, category, description) VALUES (?, ?, ?, ?)',
            [name, parseInt(price), category, description]
        );
        
        res.status(201).json({ message: 'Thêm dịch vụ thành công', serviceId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Feedback routes
app.post('/api/feedback', authenticateToken, async (req, res) => {
    try {
        const { booking_id, room_rating, service_rating, comment } = req.body;
        
        const [bookings] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [booking_id]);
        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Đặt phòng không tồn tại' });
        }
        
        const booking = bookings[0];
        
        const [existing] = await pool.execute('SELECT id FROM feedback WHERE booking_id = ?', [booking_id]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Bạn đã đánh giá cho đặt phòng này rồi' });
        }
        
        await pool.execute(
            'INSERT INTO feedback (booking_id, customer_name, room_number, room_rating, service_rating, comment, check_in, check_out) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [booking_id, booking.customer_name, booking.room_number, room_rating, service_rating, comment || '', booking.check_in, booking.check_out]
        );
        
        res.status(201).json({ message: 'Cảm ơn bạn đã đánh giá!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin routes
app.get('/api/admin/feedback', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [feedback] = await pool.execute('SELECT * FROM feedback ORDER BY created_at DESC');
        res.json({ feedback });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/admin/invoices', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [invoices] = await pool.execute('SELECT * FROM invoices ORDER BY created_at DESC');
        res.json({ invoices });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/admin/customers/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM customers WHERE id = ?', [id]);
        res.json({ message: 'Xóa tài khoản khách hàng thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Start server
async function startServer() {
    try {
        await testConnection();
        await initDatabase();
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('✅ Sử dụng MySQL database');
            console.log('📁 Database: quanlykhachsan');
        });
    } catch (error) {
        console.error('❌ Lỗi khởi động server:', error);
    }
}

startServer();

module.exports = app;