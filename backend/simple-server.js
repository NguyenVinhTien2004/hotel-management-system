const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'hotel-secret-key';

// In-memory database for testing
let users = [
    {
        id: 1,
        username: 'admin',
        name: 'Administrator',
        email: 'admin@hotel.com',
        password: 'admin123', // plain text for testing
        role: 'admin'
    },
    {
        id: 2,
        username: 'customer',
        name: 'Customer Test',
        email: 'customer@hotel.com',
        password: 'customer123',
        role: 'customer'
    }
];

let rooms = [
    { id: 1, number: '101', name: 'Phòng Đơn Tiêu Chuẩn', type: 'Đơn', price: 500000, capacity: 1, status: 'available' },
    { id: 2, number: '102', name: 'Phòng Đôi Tiêu Chuẩn', type: 'Đôi', price: 800000, capacity: 2, status: 'available' },
    { id: 3, number: '201', name: 'Phòng Gia Đình', type: 'Gia Đình', price: 1200000, capacity: 4, status: 'available' },
    { id: 4, number: '301', name: 'Phòng VIP', type: 'VIP', price: 2000000, capacity: 2, status: 'available' }
];

let services = [
    { id: 1, name: 'Giặt ủi', price: 50000, category: 'laundry', description: 'Dịch vụ giặt ủi chuyên nghiệp' },
    { id: 2, name: 'Massage', price: 200000, category: 'spa', description: 'Dịch vụ massage thư giãn' },
    { id: 3, name: 'Xe đưa đón sân bay', price: 300000, category: 'transport', description: 'Đưa đón từ/đến sân bay' },
    { id: 4, name: 'Phục vụ phòng', price: 100000, category: 'other', description: 'Dịch vụ dọn dẹp phòng' }
];

let bookings = [];
let bookingIdCounter = 1;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Request logging
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
    next();
});

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

// Auth routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        if (password !== user.password) {
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

app.post('/api/auth/admin-login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = users.find(u => u.username === username && (u.role === 'admin' || u.role === 'staff'));
        if (!user) {
            return res.status(401).json({ message: 'Tài khoản không tồn tại hoặc không có quyền truy cập' });
        }
        
        if (password !== user.password) {
            return res.status(401).json({ message: 'Mật khẩu không đúng' });
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

// Rooms routes
app.get('/api/rooms', (req, res) => {
    try {
        const { status, type } = req.query;
        let filteredRooms = rooms;
        
        if (status) {
            filteredRooms = filteredRooms.filter(room => room.status === status);
        }
        
        if (type) {
            filteredRooms = filteredRooms.filter(room => room.type === type);
        }
        
        res.json({ rooms: filteredRooms });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Services routes
app.get('/api/services', (req, res) => {
    try {
        res.json({ services });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Bookings routes
app.get('/api/bookings', authenticateToken, (req, res) => {
    try {
        res.json({ bookings });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/bookings', authenticateToken, (req, res) => {
    try {
        const { customer_name, customer_phone, customer_email, room_id, check_in, check_out, guest_count, payment_method, selected_services } = req.body;
        
        const room = rooms.find(r => r.id == room_id);
        if (!room) {
            return res.status(404).json({ message: 'Phòng không tồn tại' });
        }
        
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
        const roomAmount = room.price * nights;
        
        let servicesAmount = 0;
        if (selected_services && selected_services.length > 0) {
            servicesAmount = selected_services.reduce((sum, service) => sum + service.price, 0);
        }
        
        const totalAmount = roomAmount + servicesAmount;

        const booking = {
            id: bookingIdCounter++,
            customer_name,
            customer_phone,
            customer_email,
            room_id,
            room_number: room.number,
            room_name: room.name,
            room_type: room.type,
            check_in,
            check_out,
            guest_count,
            total_amount: totalAmount,
            payment_method: payment_method || 'cash',
            status: 'pending',
            created_at: new Date().toISOString()
        };
        
        bookings.push(booking);
        
        // Update room status
        room.status = 'occupied';
        
        res.status(201).json({ message: 'Đặt phòng thành công! Vui lòng chờ xác nhận từ nhân viên.', bookingId: booking.id });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/bookings/:id/status', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const booking = bookings.find(b => b.id == id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        booking.status = status;
        
        if (status === 'cancelled' || status === 'checked_out') {
            const room = rooms.find(r => r.id == booking.room_id);
            if (room) {
                room.status = 'available';
            }
        }
        
        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Dashboard stats
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
    try {
        const availableRooms = rooms.filter(r => r.status === 'available').length;
        const totalServices = services.length;
        const myBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;
        const myFeedbacks = 0; // Simplified
        
        res.json({
            availableRooms,
            totalServices,
            myBookings,
            myFeedbacks
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Dashboard activities
app.get('/api/dashboard/activities', authenticateToken, (req, res) => {
    try {
        const activities = bookings.slice(-5).map(booking => ({
            type: 'booking',
            title: `Đặt phòng ${booking.room_number}`,
            description: `${booking.status} - ${booking.room_name}`,
            time: booking.created_at,
            icon: '📅',
            status: booking.status
        }));
        
        res.json({ activities });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Redirect root to login page
app.get('/', (req, res) => {
    res.redirect('/index.html');
});

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ message: 'API endpoint not found' });
    } else {
        res.status(404).send('Page not found');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Simple Server đang chạy trên port ${PORT}`);
    console.log('✅ Sử dụng In-Memory database (không cần MySQL)');
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log('👤 Admin login: admin/password');
    console.log('🔍 Console logging enabled');
});

module.exports = app;
