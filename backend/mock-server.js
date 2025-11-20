const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'hotel-secret-key';

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Mock data
const mockRooms = [
    { id: 1, number: '101', name: 'Phòng Deluxe', type: 'Đơn', price: 500000, capacity: 2, status: 'available', image: '/images/phong-don/OIP.jfif' },
    { id: 2, number: '102', name: 'Phòng Superior', type: 'Đôi', price: 800000, capacity: 4, status: 'available', image: '/images/phong-doi/OIP.jfif' },
    { id: 3, number: '201', name: 'Phòng Family', type: 'Gia Đình', price: 1200000, capacity: 6, status: 'occupied', image: '/images/phong-gia-dinh/OIP.jfif' },
    { id: 4, number: '301', name: 'Phòng VIP', type: 'VIP', price: 2000000, capacity: 2, status: 'available', image: '/images/phong-vip/OIP.jfif' }
];

const mockServices = [
    { id: 1, name: 'Giặt ủi', price: 50000, category: 'laundry', description: 'Dịch vụ giặt ủi chuyên nghiệp' },
    { id: 2, name: 'Massage', price: 200000, category: 'spa', description: 'Dịch vụ massage thư giãn' },
    { id: 3, name: 'Xe đưa đón sân bay', price: 300000, category: 'transport', description: 'Đưa đón từ/đến sân bay' },
    { id: 4, name: 'Phục vụ phòng', price: 100000, category: 'other', description: 'Dịch vụ dọn dẹp phòng' }
];

let mockBookings = [];
let bookingId = 1;

// Auth
app.post('/api/auth/admin-login', (req, res) => {
    const { username, password } = req.body;
    if (password === '@') {
        const token = jwt.sign({ id: 1, username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: 1, username, name: username, role: 'admin' } });
    } else {
        res.status(401).json({ message: 'Mật khẩu không đúng' });
    }
});

app.post('/api/auth/register', (req, res) => {
    res.status(201).json({ message: 'Đăng ký thành công' });
});

app.post('/api/auth/login', (req, res) => {
    const { username } = req.body;
    const token = jwt.sign({ id: 2, username, role: 'customer' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: 2, username, name: username, role: 'customer' } });
});

// Dashboard
app.get('/api/dashboard/stats', (req, res) => {
    res.json({
        availableRooms: mockRooms.filter(r => r.status === 'available').length,
        totalBookings: mockBookings.length,
        totalServices: mockServices.length,
        myBookings: 0,
        myFeedbacks: 0
    });
});

// Rooms
app.get('/api/rooms', (req, res) => {
    res.json({ rooms: mockRooms });
});

// Services
app.get('/api/services', (req, res) => {
    res.json({ services: mockServices });
});

// Bookings
app.get('/api/bookings', (req, res) => {
    res.json({ bookings: mockBookings });
});

app.post('/api/bookings', (req, res) => {
    const booking = {
        id: bookingId++,
        ...req.body,
        status: 'pending',
        created_at: new Date()
    };
    mockBookings.push(booking);
    res.status(201).json({ message: 'Đặt phòng thành công!', bookingId: booking.id });
});

// Admin routes
app.get('/api/admin/feedback', (req, res) => {
    res.json({ feedback: [] });
});

app.get('/api/admin/invoices', (req, res) => {
    res.json({ invoices: [] });
});

app.get('/api/customers', (req, res) => {
    res.json({ customers: [] });
});

app.get('/api/admin/notifications', (req, res) => {
    res.json({ notifications: [] });
});

app.get('/api/admin/logs', (req, res) => {
    res.json({ logs: [] });
});

// Redirect root to login
app.get('/', (req, res) => {
    res.redirect('/index.html');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Mock Server running on port ${PORT}`);
    console.log('✅ Using MOCK DATA - No database needed');
    console.log('🌐 URL: http://localhost:3001');
});