const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3001;

// Database config
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456789@',
    database: 'quanlykhachsan',
    port: 3306
};

// Create connection pool
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files
app.use(express.static(__dirname + '/../frontend'));

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server hoạt động tốt!', timestamp: new Date() });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('🔐 Login request:', req.body);
        const { username, password } = req.body;
        
        // Simple auth for testing
        if (username && password) {
            const user = {
                id: 1,
                username: username,
                name: username,
                email: `${username}@hotel.com`,
                role: 'customer'
            };
            
            const token = 'simple-token-' + Date.now();
            
            console.log('✅ Login successful for:', username);
            res.json({ token, user });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('📝 Register request:', req.body);
        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (error) {
        console.error('❌ Register error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Dashboard stats route - simplified
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        console.log('📊 Dashboard stats request received');
        
        // Simple queries without authentication for testing
        const [rooms] = await pool.execute("SELECT COUNT(*) as count FROM rooms WHERE status = 'available'");
        console.log('✅ Rooms query successful:', rooms[0]);
        
        const [bookings] = await pool.execute("SELECT COUNT(*) as count FROM bookings");
        console.log('✅ Bookings query successful:', bookings[0]);
        
        const stats = {
            availableRooms: rooms[0].count,
            totalBookings: bookings[0].count,
            myBookings: 0,
            myFeedbacks: 0,
            totalServices: 0
        };
        
        console.log('📊 Sending stats:', stats);
        res.json(stats);
        
    } catch (error) {
        console.error('❌ Dashboard stats error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            stack: error.stack 
        });
    }
});

// Rooms route - simplified
app.get('/api/rooms', async (req, res) => {
    try {
        console.log('🏨 Rooms request received');
        
        const [rooms] = await pool.execute('SELECT * FROM rooms LIMIT 10');
        console.log('✅ Found', rooms.length, 'rooms');
        
        res.json({ rooms });
        
    } catch (error) {
        console.error('❌ Rooms error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// Bookings route
app.get('/api/bookings', async (req, res) => {
    try {
        console.log('📅 Bookings request received');
        const [bookings] = await pool.execute('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 10');
        console.log('✅ Found', bookings.length, 'bookings');
        res.json({ bookings });
    } catch (error) {
        console.error('❌ Bookings error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Services route
app.get('/api/services', async (req, res) => {
    try {
        console.log('🛎️ Services request received');
        const [services] = await pool.execute('SELECT * FROM services ORDER BY created_at DESC LIMIT 10');
        console.log('✅ Found', services.length, 'services');
        res.json({ services });
    } catch (error) {
        console.error('❌ Services error:', error);
        // Return empty services if table doesn't exist
        res.json({ services: [] });
    }
});

// Feedback route
app.post('/api/feedback', async (req, res) => {
    try {
        console.log('⭐ Feedback request:', req.body);
        res.status(201).json({ message: 'Cảm ơn bạn đã đánh giá!' });
    } catch (error) {
        console.error('❌ Feedback error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Notifications route - simplified
app.get('/api/notifications', async (req, res) => {
    try {
        console.log('🔔 Notifications request received');
        const notifications = [];
        console.log('✅ Sending notifications:', notifications.length);
        res.json({ notifications });
    } catch (error) {
        console.error('❌ Notifications error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Simple server running on port ${PORT}`);
    console.log('🌐 Test URL: http://localhost:3001/api/test');
    console.log('📊 Dashboard: http://localhost:3001/api/dashboard/stats');
    console.log('🏨 Rooms: http://localhost:3001/api/rooms');
    console.log('🔔 Notifications: http://localhost:3001/api/notifications');
});

// Test database connection on startup
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
}

testConnection();