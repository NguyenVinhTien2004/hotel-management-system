const jwt = require('jsonwebtoken');
const { pool } = require('../database');

const JWT_SECRET = 'hotel-secret-key';

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Token xác thực không được cung cấp' 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn' 
            });
        }
        req.user = user;
        next();
    });
};

// Middleware kiểm tra quyền admin
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false,
            message: 'Chưa đăng nhập' 
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false,
            message: 'Chỉ admin mới có quyền truy cập' 
        });
    }
    next();
};

// Middleware kiểm tra quyền staff (nhân viên)
const requireStaff = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false,
            message: 'Chưa đăng nhập' 
        });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
        return res.status(403).json({ 
            success: false,
            message: 'Chỉ nhân viên và admin mới có quyền truy cập' 
        });
    }
    next();
};

// Middleware kiểm tra quyền customer
const requireCustomer = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false,
            message: 'Chưa đăng nhập' 
        });
    }

    if (req.user.role !== 'customer') {
        return res.status(403).json({ 
            success: false,
            message: 'Chỉ khách hàng mới có quyền truy cập' 
        });
    }
    next();
};

// Middleware kiểm tra quyền sở hữu tài nguyên
const requireOwnership = (resourceType) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const resourceId = req.params.id;

            // Admin và staff có thể truy cập tất cả
            if (req.user.role === 'admin' || req.user.role === 'staff') {
                return next();
            }

            let query = '';
            let params = [];

            switch (resourceType) {
                case 'booking':
                    const [userInfo] = await pool.execute('SELECT name, email FROM users WHERE id = ?', [userId]);
                    if (userInfo.length === 0) {
                        return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
                    }
                    
                    query = 'SELECT id FROM bookings WHERE id = ? AND (customer_name = ? OR customer_email = ?)';
                    params = [resourceId, userInfo[0].name, userInfo[0].email];
                    break;

                case 'feedback':
                    const [user] = await pool.execute('SELECT name FROM users WHERE id = ?', [userId]);
                    if (user.length === 0) {
                        return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
                    }
                    
                    query = 'SELECT id FROM feedback WHERE id = ? AND customer_name = ?';
                    params = [resourceId, user[0].name];
                    break;

                case 'profile':
                    if (parseInt(resourceId) !== userId) {
                        return res.status(403).json({ 
                            success: false, 
                            message: 'Bạn chỉ có thể chỉnh sửa thông tin của chính mình' 
                        });
                    }
                    return next();

                default:
                    return res.status(400).json({ success: false, message: 'Loại tài nguyên không hợp lệ' });
            }

            const [result] = await pool.execute(query, params);
            if (result.length === 0) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Bạn không có quyền truy cập tài nguyên này' 
                });
            }

            next();
        } catch (error) {
            console.error('Lỗi kiểm tra quyền sở hữu:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    };
};

// Middleware kiểm tra quyền truy cập dựa trên vai trò
const checkPermission = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'Chưa đăng nhập' 
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: `Chỉ ${allowedRoles.join(', ')} mới có quyền truy cập` 
            });
        }

        next();
    };
};

// Function ghi log hoạt động
const writeActivityLog = async (req, targetId, reason = '', details = '') => {
    try {
        if (req.user?.role === 'customer') {
            return; // Không ghi log cho customer
        }

        await pool.execute(
            'INSERT INTO admin_logs (admin_id, admin_name, action, target_type, target_id, reason, details) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                req.user.id,
                req.user.username,
                req.method,
                'api_call',
                targetId,
                reason,
                details
            ]
        );
    } catch (error) {
        console.error('Lỗi ghi log hoạt động:', error);
    }
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireStaff,
    requireCustomer,
    requireOwnership,
    checkPermission,
    writeActivityLog,
    JWT_SECRET
};