const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const { pool, testConnection, initDatabase } = require('./database-mysql-only');

const app = express();

// Function g hi nhật ký hoạt động admin
async function logAdminActivity(adminId, adminName, action, targetType, targetId, reason = '', details = '') {
    try {
        await pool.execute(
            'INSERT INTO admin_logs (admin_id, admin_name, action, target_type, target_id, reason, details) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [adminId, adminName, action, targetType, targetId, reason, details]
        );
    } catch (error) {
        console.error('Lỗi ghi nhật ký:', error);
    }
}

// Function tạo hoạt động cho khách hàng
async function createCustomerActivity(userId, type, title, description, targetId = null) {
    try {
        // Tạo bảng customer_activities nếu chưa có
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS customer_activities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                target_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user_created (user_id, created_at)
            )
        `);
        
        await pool.execute(
            'INSERT INTO customer_activities (user_id, type, title, description, target_id) VALUES (?, ?, ?, ?, ?)',
            [userId, type, title, description, targetId]
        );
    } catch (error) {
        console.error('Lỗi tạo hoạt động khách hàng:', error);
    }
}
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'hotel-secret-key';

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
    next();
});

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

app.use(express.json());

// Serve static files with no-cache headers
app.use(express.static(path.join(__dirname, '../frontend'), {
    setHeaders: (res, filePath) => {
        // BẮT BUỘC KHÔNG CACHE TẤT CẢ FILE
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('ETag', 'false');
        res.setHeader('Last-Modified', new Date().toUTCString());
        
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
        
        if (filePath.endsWith('.js') && !filePath.includes('/api/')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Function to get different image for each room by type
function getRoomImage(roomType, roomId) {
    const imageOptions = {
        'Đơn': [
            'images/phong-don/OIP.jfif',
            'images/phong-don/OIP (1).jfif',
            'images/phong-don/OIP (2).jfif',
            'images/phong-don/OIP (3).jfif',
            'images/phong-don/OIP (4).jfif'
        ],
        'Đôi': [
            'images/phong-doi/OIP.jfif',
            'images/phong-doi/OIP (1).jfif',
            'images/phong-doi/OIP (2).jfif',
            'images/phong-doi/OIP (3).jfif',
            'images/phong-doi/OIP (5).jfif'
        ],
        'Gia Đình': [
            'images/phong-gia-dinh/OIP.jfif',
            'images/phong-gia-dinh/OIP (1).jfif',
            'images/phong-gia-dinh/OIP (2).jfif',
            'images/phong-gia-dinh/OIP (3).jfif',
            'images/phong-gia-dinh/OIP (4).jfif'
        ],
        'VIP': [
            'images/phong-vip/OIP.jfif',
            'images/phong-vip/OIP (1).jfif',
            'images/phong-vip/OIP (2).jfif',
            'images/phong-vip/OIP (3).jfif',
            'images/phong-vip/OIP (5).jfif'
        ]
    };
    
    const options = imageOptions[roomType] || ['images/placeholder.jpg'];
    // Sử dụng roomId để đảm bảo mỗi phòng có hình khác nhau
    const index = (roomId - 1) % options.length;
    return options[index];
}

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
        
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE username = ? AND (role = "admin" OR role = "staff")',
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Tài khoản không tồn tại hoặc không có quyền truy cập' });
        }
        
        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
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

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, name, email, password } = req.body;
        
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
        const userId = req.user.id;
        const userEmail = req.user.email;
        
        // Dashboard stats with proper user filtering
        const [availableRooms] = await pool.execute("SELECT COUNT(*) as count FROM rooms WHERE status = 'available'");
        const [totalServices] = await pool.execute('SELECT COUNT(*) as count FROM services');
        
        // Get current user info
        const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
        const currentUser = users[0] || {};
        
        // Get user's ACTIVE bookings (pending, confirmed or checked_in) - not history
        let myActiveRoomsCount = 0;
        if (currentUser.email) {
            const [emailBookings] = await pool.execute('SELECT COUNT(*) as count FROM bookings WHERE customer_email = ? AND status IN ("pending", "confirmed", "checked_in")', [currentUser.email]);
            myActiveRoomsCount = emailBookings[0].count;
        }
        if (myActiveRoomsCount === 0 && currentUser.name) {
            const [nameBookings] = await pool.execute('SELECT COUNT(*) as count FROM bookings WHERE customer_name = ? AND status IN ("pending", "confirmed", "checked_in")', [currentUser.name]);
            myActiveRoomsCount = nameBookings[0].count;
        }
        
        // Get user's COMPLETED feedbacks only
        let myFeedbacksCount = 0;
        if (currentUser.name) {
            const [feedbacks] = await pool.execute('SELECT COUNT(*) as count FROM feedback WHERE customer_name = ? AND room_rating > 0 AND service_rating > 0', [currentUser.name]);
            myFeedbacksCount = feedbacks[0].count;
            console.log(`📊 User ${currentUser.name} has ${myFeedbacksCount} completed feedbacks`);
            
            // Debug: Show all vs completed
            const [allFeedbacks] = await pool.execute('SELECT COUNT(*) as count FROM feedback WHERE customer_name = ?', [currentUser.name]);
            console.log(`📊 Total feedbacks: ${allFeedbacks[0].count}, Completed: ${myFeedbacksCount}`);
        }
        
        res.json({
            availableRooms: availableRooms[0].count,
            totalServices: totalServices[0].count,
            myBookings: myActiveRoomsCount,
            myFeedbacks: myFeedbacksCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Recent activities for customer
app.get('/api/dashboard/activities', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email || '';
        const userName = req.user.username || req.user.name || 'Unknown';
        
        // Get current user info from database
        let currentUser = null;
        try {
            const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
            currentUser = users[0] || null;
        } catch (userError) {
            console.log('Could not fetch user info:', userError);
        }
        
        const activities = [];
        
        // Get recent bookings - try multiple methods to find user's bookings
        let bookings = [];
        try {
            if (userEmail) {
                const [emailBookings] = await pool.execute(
                    'SELECT * FROM bookings WHERE customer_email = ? ORDER BY created_at DESC LIMIT 5',
                    [userEmail]
                );
                bookings = emailBookings;
            }
            
            // If no bookings found by email, try by name
            if (bookings.length === 0 && currentUser?.name) {
                const [nameBookings] = await pool.execute(
                    'SELECT * FROM bookings WHERE customer_name = ? ORDER BY created_at DESC LIMIT 5',
                    [currentUser.name]
                );
                bookings = nameBookings;
            }
        } catch (bookingError) {
            console.log('Error fetching bookings:', bookingError);
            bookings = [];
        }
        
        bookings.forEach(booking => {
            const statusText = {
                'pending': 'Chờ xác nhận',
                'confirmed': 'Đã xác nhận', 
                'checked_in': 'Đã nhận phòng',
                'checked_out': 'Đã trả phòng',
                'cancelled': 'Đã hủy'
            };
            
            activities.push({
                type: 'booking',
                title: `Đặt phòng ${booking.room_number}`,
                description: `${statusText[booking.status]} - ${booking.room_name}`,
                time: booking.created_at,
                icon: '📅',
                status: booking.status
            });
        });
        
        // Get recent feedback - sử dụng userName thay vì userId
        let feedback = [];
        try {
            const searchName = currentUser?.name || userName || 'Unknown';
            const [feedbackResults] = await pool.execute(
                'SELECT * FROM feedback WHERE customer_name = ? ORDER BY created_at DESC LIMIT 3',
                [searchName]
            );
            feedback = feedbackResults;
        } catch (feedbackError) {
            console.log('Error fetching feedback:', feedbackError);
            feedback = [];
        }
        
        feedback.forEach(fb => {
            activities.push({
                type: 'feedback',
                title: `Đánh giá phòng ${fb.room_number}`,
                description: `${fb.room_rating} sao - ${fb.comment ? fb.comment.substring(0, 50) + '...' : 'Không có nhận xét'}`,
                time: fb.created_at,
                icon: '⭐',
                status: 'completed'
            });
        });
        
        // Sort by time
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        res.json({ activities: activities.slice(0, 8) });
    } catch (error) {
        console.error('Activities error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Rooms routes - Public API, không cần token
app.get('/api/rooms', async (req, res) => {
    try {
        const { status, type } = req.query;
        console.log(`🏨 GET /api/rooms - Filters: status=${status}, type=${type}`);
        
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
        
        console.log(`📝 SQL Query: ${query}`);
        console.log(`📝 Params: ${JSON.stringify(params)}`);
        
        const [rooms] = await pool.execute(query, params);
        console.log(`✅ Found ${rooms.length} rooms`);
        
        // Log room types
        const roomTypes = rooms.reduce((acc, room) => {
            acc[room.type] = (acc[room.type] || 0) + 1;
            return acc;
        }, {});
        console.log(`📊 Room types:`, roomTypes);
        
        // GIỮ NGUYÊN hình ảnh từ database, chỉ thêm nếu chưa có
        const roomsWithImages = rooms.map(room => ({
            ...room,
            image: room.image || getRoomImage(room.type, room.id)
        }));
        
        res.json({ rooms: roomsWithImages });
    } catch (error) {
        console.error('❌ Rooms API error:', error);
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

        // Ghi nhật ký
        await logAdminActivity(
            req.user.id, 
            req.user.username, 
            'CREATE', 
            'room', 
            result.insertId, 
            'Thêm phòng mới', 
            `Thêm phòng ${number} - ${type} - ${price}`
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

app.delete('/api/rooms/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Lấy thông tin phòng trước khi xóa
        const [rooms] = await pool.execute('SELECT * FROM rooms WHERE id = ?', [id]);
        const room = rooms[0];
        
        await pool.execute('DELETE FROM rooms WHERE id = ?', [id]);
        
        // Ghi nhật ký
        if (room) {
            await logAdminActivity(
                req.user.id, 
                req.user.username, 
                'DELETE', 
                'room', 
                id, 
                'Xóa phòng', 
                `Xóa phòng ${room.number} - ${room.type}`
            );
        }
        
        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Bookings routes - Cần token
app.get('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        
        // Simplified - return all bookings for testing
        const [bookings] = await pool.execute('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 20');
        res.json({ bookings });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const { customer_name, customer_phone, customer_email, room_id, check_in, check_out, guest_count, payment_method, selected_services } = req.body;
        
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
        const roomAmount = room.price * nights;
        
        // Calculate services amount
        let servicesAmount = 0;
        if (selected_services && selected_services.length > 0) {
            servicesAmount = selected_services.reduce((sum, service) => sum + service.price, 0);
        }
        
        const totalAmount = roomAmount + servicesAmount;

        const [result] = await pool.execute(
            'INSERT INTO bookings (customer_name, customer_phone, customer_email, room_id, room_number, room_name, room_type, check_in, check_out, guest_count, total_amount, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [customer_name, customer_phone, customer_email, room_id, room.number, room.name, room.type, check_in, check_out, guest_count, totalAmount, payment_method || 'cash', 'pending']
        );
        
        // Save selected services using existing invoice_services table
        if (selected_services && selected_services.length > 0) {
            // Create invoice for this booking with services
            const [invoiceResult] = await pool.execute(
                'INSERT INTO invoices (booking_id, customer_name, room_charges, service_charges, total_amount, status) VALUES (?, ?, ?, ?, ?, ?)',
                [result.insertId, customer_name, roomAmount, servicesAmount, totalAmount, 'pending']
            );
            
            // Add services to invoice_services
            for (const service of selected_services) {
                await pool.execute(
                    'INSERT INTO invoice_services (invoice_id, service_id, service_name, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?)',
                    [invoiceResult.insertId, service.id, service.name, 1, service.price, service.price]
                );
            }
        }
        
        // Update room status to occupied
        await pool.execute('UPDATE rooms SET status = ? WHERE id = ?', ['occupied', room_id]);
        console.log(`Updated room ${room.number} status to occupied`);
        
        // Add customer if not exists
        const [existingCustomer] = await pool.execute('SELECT id FROM customers WHERE phone = ?', [customer_phone]);
        if (existingCustomer.length === 0) {
            await pool.execute(
                'INSERT INTO customers (name, phone, email, address, id_number) VALUES (?, ?, ?, ?, ?)',
                [customer_name, customer_phone, customer_email, '', '']
            );
        }

        // Tạo thông báo cho admin
        await createNotification(
            'new_booking',
            'Đặt phòng mới',
            `Khách hàng ${customer_name} đã đặt phòng ${room.number} - ${room.name}`,
            result.insertId,
            false
        );
        
        // Tạo hoạt động cho khách hàng
        await createCustomerActivity(
            req.user.id,
            'booking_created',
            `Đặt phòng ${room.number}`,
            `Đã tạo đặt phòng ${room.name} - Chờ xác nhận`,
            result.insertId
        );
        
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

        // Admin và staff có thể cập nhật mọi trạng thái
        if (user.role === 'admin' || user.role === 'staff') {
            console.log(`🔧 Admin/Staff ${user.username} updating booking ${id} to ${status}`);
            // Admin có full quyền, không cần kiểm tra gì thêm
        } else if (user.role === 'customer') {
            // Khách hàng chỉ được hủy phòng của mình
            if (status !== 'cancelled') {
                return res.status(403).json({ message: 'Khách hàng chỉ có thể hủy đặt phòng' });
            }
            
            // Kiểm tra đây có phải đơn của khách hàng không
            const [userInfo] = await pool.execute('SELECT name, email FROM users WHERE id = ?', [user.id]);
            if (userInfo.length === 0) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }
            
            const userData = userInfo[0];
            if (booking.customer_name !== userData.name && booking.customer_email !== userData.email) {
                return res.status(403).json({ message: 'Bạn chỉ có thể hủy đặt phòng của mình' });
            }
        }

        await pool.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

        if (status === 'cancelled' || status === 'checked_out') {
            await pool.execute('UPDATE rooms SET status = ? WHERE id = ?', ['available', booking.room_id]);
            console.log(`Updated room ${booking.room_number} status to available (${status})`);
        }

        // Tự động tạo hóa đơn khi trả phòng
        if (status === 'checked_out') {
            try {
                await pool.execute(
                    'INSERT INTO invoices (booking_id, customer_name, room_charges, service_charges, total_amount, status) VALUES (?, ?, ?, ?, ?, ?)',
                    [booking.id, booking.customer_name, booking.total_amount, 0, booking.total_amount, 'paid']
                );
                console.log(`Đã tạo hóa đơn cho booking #${booking.id}`);
            } catch (invoiceError) {
                console.error('Lỗi tạo hóa đơn:', invoiceError);
            }
        }

        // Ghi nhật ký hoạt động admin
        if (user.role === 'admin' || user.role === 'staff') {
            const statusText = {
                'confirmed': 'xác nhận',
                'checked_in': 'nhận phòng', 
                'checked_out': 'trả phòng',
                'cancelled': 'hủy'
            };
            
            await logAdminActivity(
                user.id,
                user.username,
                'UPDATE',
                'booking',
                id,
                `Cập nhật trạng thái đặt phòng`,
                `${statusText[status] || status} đặt phòng #${id} - Khách: ${booking.customer_name} - Phòng: ${booking.room_number}`
            );
        }

        // Tạo thông báo cho khách hàng khi admin cập nhật trạng thái
        if (user.role === 'admin' || user.role === 'staff') {
            const statusMessages = {
                'confirmed': `Đặt phòng #${id} của bạn đã được xác nhận`,
                'checked_in': `Bạn đã nhận phòng ${booking.room_number} thành công`,
                'checked_out': `Bạn đã trả phòng ${booking.room_number} thành công`,
                'cancelled': `Đặt phòng #${id} của bạn đã bị hủy`
            };
            
            if (statusMessages[status]) {
                await createNotification(
                    'booking_update',
                    'Cập nhật đặt phòng',
                    statusMessages[status],
                    id,
                    true
                );
            }
        } else {
            // Khách hàng tự hủy đặt phòng
            if (status === 'cancelled') {
                await createCustomerActivity(
                    user.id,
                    'booking_cancelled',
                    `Hủy đặt phòng ${booking.room_number}`,
                    `Đã hủy đặt phòng ${booking.room_name}`,
                    id
                );
            }
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

app.post('/api/customers', authenticateToken, async (req, res) => {
    try {
        const { name, phone, email, address, id_number } = req.body;
        
        const [result] = await pool.execute(
            'INSERT INTO customers (name, phone, email, address, id_number) VALUES (?, ?, ?, ?, ?)',
            [name, phone, email, address, id_number]
        );
        
        res.status(201).json({ message: 'Customer created successfully', customerId: result.insertId });
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

// Services routes - Public API, không cần token
app.get('/api/services', async (req, res) => {
    try {
        console.log('🛎️ Loading services...');
        const [services] = await pool.execute('SELECT * FROM services ORDER BY created_at DESC');
        console.log('✅ Found', services.length, 'services');
        
        // Tự động sửa giá dịch vụ có giá quá thấp
        for (const service of services) {
            if (service.price < 1000) {
                const newPrice = service.price * 1000;
                await pool.execute('UPDATE services SET price = ? WHERE id = ?', [newPrice, service.id]);
                console.log(`🔄 Updated service ${service.name}: ${service.price} -> ${newPrice} VND`);
                service.price = newPrice;
            }
        }
        
        // Nếu không có dịch vụ, thêm một số dịch vụ mẫu
        if (services.length === 0) {
            console.log('🔄 Adding sample services...');
            const sampleServices = [
                ['Giặt ủi', 50000, 'laundry', 'Dịch vụ giặt ủi chuyên nghiệp'],
                ['Massage', 200000, 'spa', 'Dịch vụ massage thư giãn'],
                ['Xe đưa đón sân bay', 300000, 'transport', 'Đưa đón từ/đến sân bay'],
                ['Phục vụ phòng', 100000, 'other', 'Dịch vụ dọn dẹp phòng'],
                ['Bơi lội', 50000, 'other', 'Sử dụng hồ bơi khách sạn'],
                ['Tập gym', 200000, 'other', 'Sử dụng phòng tập gym'],
                ['Đưa đón sân bay', 300000, 'transport', 'Dịch vụ đưa đón sân bay'],
                ['Ăn uống', 100000, 'food', 'Dịch vụ ăn uống tại phòng'],
                ['Giặt ủi', 100000, 'laundry', 'Dịch vụ giặt ủi cao cấp']
            ];
            
            for (const service of sampleServices) {
                await pool.execute(
                    'INSERT INTO services (name, price, category, description) VALUES (?, ?, ?, ?)',
                    service
                );
            }
            
            // Load lại sau khi thêm
            const [newServices] = await pool.execute('SELECT * FROM services ORDER BY created_at DESC');
            console.log('✅ Added', newServices.length, 'sample services');
            res.json({ services: newServices });
        } else {
            res.json({ services });
        }
    } catch (error) {
        console.error('❌ Services error:', error);
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

app.put('/api/services/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, category, description } = req.body;
        
        await pool.execute(
            'UPDATE services SET name = ?, price = ?, category = ?, description = ? WHERE id = ?',
            [name, parseInt(price), category, description, id]
        );
        
        res.json({ message: 'Cập nhật dịch vụ thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/services/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM services WHERE id = ?', [id]);
        res.json({ message: 'Xóa dịch vụ thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Feedback routes
app.post('/api/feedback', async (req, res) => {
    try {
        console.log('⭐ Feedback request:', req.body);
        const { booking_id, room_rating, service_rating, comment } = req.body;
        
        const [bookings] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [booking_id]);
        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Đặt phòng không tồn tại' });
        }
        
        const booking = bookings[0];
        
        const result = await pool.execute(
            'INSERT INTO feedback (booking_id, customer_name, room_number, room_name, room_rating, service_rating, comment, check_in, check_out) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [booking_id, booking.customer_name, booking.room_number, booking.room_name, room_rating, service_rating, comment || '', booking.check_in, booking.check_out]
        );
        
        console.log('✅ Feedback saved with ID:', result[0].insertId);
        
        // Tạo hoạt động cho khách hàng (nếu có token)
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, JWT_SECRET);
                await createCustomerActivity(
                    decoded.id,
                    'feedback_created',
                    `Đánh giá phòng ${booking.room_number}`,
                    `Đã đánh giá ${room_rating} sao cho phòng ${booking.room_name}`,
                    result[0].insertId
                );
            } catch (tokenError) {
                console.log('Không thể tạo hoạt động feedback (token không hợp lệ)');
            }
        }
        
        res.status(201).json({ message: 'Cảm ơn bạn đã đánh giá!' });
    } catch (error) {
        console.error('❌ Feedback error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Get feedback - moved before static files
app.get('/api/feedback', async (req, res) => {
    try {
        console.log('📋 Loading feedback...');
        const { booking_id } = req.query;
        
        let query = 'SELECT * FROM feedback';
        let params = [];
        
        if (booking_id) {
            query += ' WHERE booking_id = ?';
            params.push(booking_id);
        } else {
            query += ' ORDER BY created_at DESC LIMIT 20';
        }
        
        const [feedback] = await pool.execute(query, params);
        console.log('✅ Found', feedback.length, 'feedback records');
        res.json({ feedback });
    } catch (error) {
        console.error('❌ Feedback load error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get booking details
app.get('/api/bookings/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📝 Loading booking details for ID: ${id}`);
        
        // Lấy thông tin booking
        const [bookings] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [id]);
        console.log(`📊 Found ${bookings.length} booking(s)`);
        
        if (bookings.length === 0) {
            console.log(`❌ Booking ${id} not found`);
            return res.status(404).json({ message: 'Booking không tồn tại' });
        }
        
        const booking = bookings[0];
        console.log(`✅ Booking found:`, booking.customer_name, booking.room_number);
        
        // Lấy dịch vụ đã đặt
        const [services] = await pool.execute(`
            SELECT 
                ins.service_id,
                ins.service_name as name,
                ins.price,
                ins.quantity,
                s.category
            FROM invoice_services ins
            LEFT JOIN invoices i ON ins.invoice_id = i.id
            LEFT JOIN services s ON ins.service_id = s.id
            WHERE i.booking_id = ?
        `, [id]);
        
        console.log(`🛎 Found ${services.length} service(s) for booking ${id}`);
        
        // Thêm thông tin dịch vụ vào booking
        booking.services = services;
        booking.guests = booking.guest_count;
        
        console.log(`✅ Returning booking data for ${booking.customer_name}`);
        res.json({ booking });
    } catch (error) {
        console.error('❌ Error loading booking details:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Get booked services for a booking
app.get('/api/bookings/:id/services', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Sử dụng bảng invoice_services có sẵn
        const [services] = await pool.execute(`
            SELECT 
                ins.service_id,
                ins.service_name,
                ins.price as service_price,
                s.category
            FROM invoice_services ins
            LEFT JOIN invoices i ON ins.invoice_id = i.id
            LEFT JOIN services s ON ins.service_id = s.id
            WHERE i.booking_id = ?
        `, [id]);
        
        res.json({ services });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Service ratings routes
app.post('/api/service-ratings', async (req, res) => {
    try {
        const { service_id, booking_id, rating, comment } = req.body;
        
        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5 sao' });
        }
        
        // Check if booking exists
        const [bookings] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [booking_id]);
        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Đặt phòng không tồn tại' });
        }
        
        // Check if service exists
        const [services] = await pool.execute('SELECT * FROM services WHERE id = ?', [service_id]);
        if (services.length === 0) {
            return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
        }
        
        const booking = bookings[0];
        const service = services[0];
        
        // Create service_ratings table if not exists
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS service_ratings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                service_id INT NOT NULL,
                service_name VARCHAR(100) NOT NULL,
                booking_id INT NOT NULL,
                customer_name VARCHAR(100) NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (service_id) REFERENCES services(id),
                FOREIGN KEY (booking_id) REFERENCES bookings(id)
            )
        `);
        
        // Insert service rating
        const [result] = await pool.execute(
            'INSERT INTO service_ratings (service_id, service_name, booking_id, customer_name, rating, comment) VALUES (?, ?, ?, ?, ?, ?)',
            [service_id, service.name, booking_id, booking.customer_name, rating, comment || '']
        );
        
        console.log('✅ Service rating saved with ID:', result.insertId);
        res.status(201).json({ message: 'Cảm ơn bạn đã đánh giá dịch vụ!' });
    } catch (error) {
        console.error('❌ Service rating error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Get service ratings
app.get('/api/service-ratings', async (req, res) => {
    try {
        const { service_id } = req.query;
        
        let query = 'SELECT sr.*, s.name as service_name FROM service_ratings sr LEFT JOIN services s ON sr.service_id = s.id';
        let params = [];
        
        if (service_id) {
            query += ' WHERE sr.service_id = ?';
            params.push(service_id);
        }
        
        query += ' ORDER BY sr.created_at DESC';
        
        const [ratings] = await pool.execute(query, params);
        
        // Calculate average rating if service_id is provided
        let averageRating = null;
        if (service_id && ratings.length > 0) {
            const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
            averageRating = (sum / ratings.length).toFixed(1);
        }
        
        res.json({ 
            ratings,
            averageRating,
            totalRatings: ratings.length
        });
    } catch (error) {
        console.error('❌ Service ratings load error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get service statistics
app.get('/api/services/:id/stats', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get service info
        const [services] = await pool.execute('SELECT * FROM services WHERE id = ?', [id]);
        if (services.length === 0) {
            return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
        }
        
        // Get ratings
        const [ratings] = await pool.execute(
            'SELECT rating FROM service_ratings WHERE service_id = ?',
            [id]
        );
        
        let stats = {
            service: services[0],
            totalRatings: ratings.length,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
        
        if (ratings.length > 0) {
            const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
            stats.averageRating = (sum / ratings.length).toFixed(1);
            
            // Count rating distribution
            ratings.forEach(r => {
                stats.ratingDistribution[r.rating]++;
            });
        }
        
        res.json(stats);
    } catch (error) {
        console.error('❌ Service stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/admin/feedback', authenticateToken, async (req, res) => {
    try {
        console.log(`📋 Admin feedback request from user:`, req.user);
        
        // Check admin role
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            console.log(`❌ Access denied for role: ${req.user.role}`);
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }
        
        const [feedback] = await pool.execute('SELECT * FROM feedback ORDER BY created_at DESC');
        console.log(`✅ Found ${feedback.length} feedback records`);
        res.json({ feedback });
    } catch (error) {
        console.error('❌ Admin feedback error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Invoices routes
app.get('/api/admin/invoices', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [invoices] = await pool.execute('SELECT * FROM invoices ORDER BY created_at DESC');
        res.json({ invoices });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/admin/invoices', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { booking_id, customer_name, room_charges, services } = req.body;
        
        console.log('Tạo hóa đơn với dữ liệu:', { booking_id, customer_name, room_charges, services });
        
        // Validation
        if (!booking_id || !customer_name || !room_charges) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }
        
        // Kiểm tra booking có tồn tại không
        const [bookings] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [booking_id]);
        if (bookings.length === 0) {
            return res.status(404).json({ message: `Không tìm thấy đặt phòng với ID ${booking_id}` });
        }
        
        // Kiểm tra hóa đơn đã tồn tại chưa
        const [existingInvoice] = await pool.execute('SELECT id FROM invoices WHERE booking_id = ?', [booking_id]);
        if (existingInvoice.length > 0) {
            return res.status(400).json({ message: 'Hóa đơn cho đặt phòng này đã tồn tại' });
        }
        
        let service_charges = 0;
        if (services && services.length > 0) {
            service_charges = services.reduce((sum, s) => sum + (s.total || 0), 0);
        }
        
        const total_amount = parseFloat(room_charges) + service_charges;
        
        const [result] = await pool.execute(
            'INSERT INTO invoices (booking_id, customer_name, room_charges, service_charges, total_amount, status) VALUES (?, ?, ?, ?, ?, ?)',
            [booking_id, customer_name, parseFloat(room_charges), service_charges, total_amount, 'pending']
        );
        
        if (services && services.length > 0) {
            for (const service of services) {
                await pool.execute(
                    'INSERT INTO invoice_services (invoice_id, service_id, service_name, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?)',
                    [result.insertId, service.service_id || null, service.service_name, service.quantity || 1, service.price || 0, service.total || 0]
                );
            }
        }
        
        res.status(201).json({ message: 'Tạo hóa đơn thành công', invoiceId: result.insertId });
    } catch (error) {
        console.error('Lỗi tạo hóa đơn:', error);
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
});

app.delete('/api/admin/invoices/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM invoice_services WHERE invoice_id = ?', [id]);
        await pool.execute('DELETE FROM invoices WHERE id = ?', [id]);
        res.json({ message: 'Xóa hóa đơn thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Profile routes
app.put('/api/profile/update', authenticateToken, async (req, res) => {
    try {
        const { name, email } = req.body;
        
        await pool.execute(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [name, email, req.user.id]
        );
        
        res.json({ message: 'Cập nhật thông tin thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/profile/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const [users] = await pool.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
        
        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Function tạo thông báo
async function createNotification(type, title, message, targetId = null, forCustomers = false) {
    try {
        await pool.execute(
            'INSERT INTO notifications (type, title, message, booking_id, feedback_id, service_id, for_customers, read_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [type, title, message, 
             type === 'new_booking' ? targetId : null,
             type === 'new_feedback' ? targetId : null, 
             type === 'new_service' ? targetId : null,
             forCustomers, false]
        );
    } catch (error) {
        console.error('Lỗi tạo thông báo:', error);
    }
}

// Notifications routes
app.get('/api/admin/notifications', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [notifications] = await pool.execute(
            'SELECT * FROM notifications WHERE for_customers = FALSE ORDER BY created_at DESC LIMIT 50'
        );
        res.json({ notifications });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/admin/notifications/:id/read', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await pool.execute('UPDATE notifications SET read_status = TRUE WHERE id = ?', [req.params.id]);
        res.json({ message: 'Đánh dấu đã đọc' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/notifications', async (req, res) => {
    try {
        // Return empty notifications for now
        const notifications = [];
        res.json({ notifications });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/admin/logs', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [logs] = await pool.execute(
            'SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 100'
        );
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`❌ Error: ${err.message} - Path: ${req.path}`);
    res.status(500).json({ message: 'Server error' });
});

// Handle Chrome DevTools requests silently
app.get('/.well-known/*', (req, res) => {
    res.status(404).end();
});

// Fix malformed URLs with colon instead of slash
app.use('/api/bookings/:id/status:*', (req, res) => {
    console.log(`🔧 Fixed malformed URL: ${req.originalUrl}`);
    res.status(400).json({ message: 'Malformed URL - use /status/ instead of /status:' });
});

// Redirect root to login page
app.get('/', (req, res) => {
    res.redirect('/index.html');
});

// 404 handler
app.use((req, res) => {
    if (req.path.includes('.well-known')) {
        res.status(404).end();
        return;
    }
    console.log(`⚠️ 404 Not Found: ${req.path}`);
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ message: 'API endpoint not found' });
    } else {
        res.status(404).send('Page not found');
    }
});

// Tạo tài khoản admin mặc định
async function createDefaultAdmin() {
    try {
        // Kiểm tra xem đã có admin chưa
        const [admins] = await pool.execute('SELECT id FROM users WHERE username = "admin"');
        
        if (admins.length === 0) {
            // Tạo tài khoản admin mặc định
            const hashedPassword = await bcrypt.hash('@@@@', 10);
            await pool.execute(
                'INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
                ['admin', 'Administrator', 'admin@cocotier.com', hashedPassword, 'admin']
            );
            console.log('✅ Đã tạo tài khoản admin mặc định: admin/@@@@');
        } else {
            // Cập nhật mật khẩu admin nếu đã tồn tại
            const hashedPassword = await bcrypt.hash('@@@@', 10);
            await pool.execute(
                'UPDATE users SET password = ?, role = "admin" WHERE username = "admin"',
                [hashedPassword]
            );
            console.log('✅ Đã cập nhật mật khẩu admin: admin/@@@@');
        }
    } catch (error) {
        console.error('Lỗi tạo tài khoản admin:', error);
    }
}

// Start server
async function startServer() {
    try {
        console.log('🔄 Đang kết nối MySQL...');
        await testConnection();
        
        console.log('🔄 Đang khởi tạo database...');
        await initDatabase();
        
        console.log('🔄 Đang tạo tài khoản mặc định...');
        await createDefaultAdmin();
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server đang chạy trên port ${PORT}`);
            console.log('✅ Sử dụng MySQL database');
            console.log('📁 Database: quanlykhachsan');
            console.log('🌐 Frontend: http://localhost:3001');
            console.log('🔍 Console logging enabled - Kiểm tra lỗi tại đây!');
        });
    } catch (error) {
        console.error('❌ Lỗi khởi động server:', error);
        console.log('💡 Kiểm tra lại:');
        console.log('   - MySQL đã chạy chưa?');
        console.log('   - Thông tin kết nối trong database.js đúng chưa?');
        console.log('   - Database quanlykhachsan đã tồn tại chưa?');
        process.exit(1);
    }
}

startServer();

module.exports = app;