const jwt = require('jsonwebtoken');
const { pool } = require('../database');
const { hasPermission, ALLOWED_ROUTES } = require('./role-permissions');

const JWT_SECRET = 'hotel-secret-key';

// ===== MIDDLEWARE XÁC THỰC TOKEN =====
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

// ===== MIDDLEWARE PHÂN QUYỀN THEO VAI TRÒ =====

// Chỉ Admin
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false,
            message: 'Chỉ Admin mới có quyền truy cập' 
        });
    }
    next();
};

// Admin hoặc Staff
const requireStaff = (req, res, next) => {
    if (!req.user || !['admin', 'staff'].includes(req.user.role)) {
        return res.status(403).json({ 
            success: false,
            message: 'Chỉ Admin và Nhân viên mới có quyền truy cập' 
        });
    }
    next();
};

// Chỉ Customer
const requireCustomer = (req, res, next) => {
    if (!req.user || req.user.role !== 'customer') {
        return res.status(403).json({ 
            success: false,
            message: 'Chỉ Khách hàng mới có quyền truy cập' 
        });
    }
    next();
};

// ===== MIDDLEWARE KIỂM TRA QUYỀN CHI TIẾT =====
const checkResourcePermission = (resource, action) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Chưa đăng nhập'
            });
        }

        if (!hasPermission(req.user.role, resource, action)) {
            return res.status(403).json({
                success: false,
                message: `Vai trò ${req.user.role} không có quyền ${action} trong ${resource}`
            });
        }

        next();
    };
};

// ===== MIDDLEWARE KIỂM TRA QUYỀN SỞ HỮU =====
const requireOwnership = (resourceType) => {
    return async (req, res, next) => {
        try {
            // Admin và staff có thể truy cập tất cả
            if (['admin', 'staff'].includes(req.user.role)) {
                return next();
            }

            const userId = req.user.id;
            const resourceId = req.params.id;

            let query = '';
            let params = [];

            switch (resourceType) {
                case 'booking':
                    // Kiểm tra booking có thuộc về user không
                    const [userInfo] = await pool.execute('SELECT name, email FROM users WHERE id = ?', [userId]);
                    if (userInfo.length === 0) {
                        return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
                    }
                    
                    query = 'SELECT id FROM bookings WHERE id = ? AND (customer_name = ? OR customer_email = ?)';
                    params = [resourceId, userInfo[0].name, userInfo[0].email];
                    break;

                case 'profile':
                    // Kiểm tra profile có phải của user không
                    if (parseInt(resourceId) !== userId) {
                        return res.status(403).json({ 
                            success: false, 
                            message: 'Bạn chỉ có thể chỉnh sửa thông tin của chính mình' 
                        });
                    }
                    return next();

                case 'feedback':
                    // Kiểm tra feedback có thuộc về user không
                    const [user] = await pool.execute('SELECT name FROM users WHERE id = ?', [userId]);
                    if (user.length === 0) {
                        return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
                    }
                    
                    query = 'SELECT id FROM feedback WHERE id = ? AND customer_name = ?';
                    params = [resourceId, user[0].name];
                    break;

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

// ===== MIDDLEWARE KIỂM TRA ROUTE PERMISSION =====
const checkRoutePermission = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Chưa đăng nhập'
        });
    }

    const userRole = req.user.role;
    const method = req.method;
    const path = req.path;
    const routePattern = `${method} ${path}`;

    // Admin có quyền truy cập tất cả
    if (userRole === 'admin') {
        return next();
    }

    const allowedRoutes = ALLOWED_ROUTES[userRole] || [];
    
    // Kiểm tra exact match hoặc wildcard match
    const hasAccess = allowedRoutes.some(route => {
        if (route.includes('*')) {
            const pattern = route.replace('*', '.*');
            const regex = new RegExp(`^${pattern}$`);
            return regex.test(routePattern);
        }
        
        // Kiểm tra route có parameter (:id)
        if (route.includes(':')) {
            const routeRegex = route.replace(/:[^/]+/g, '[^/]+');
            const regex = new RegExp(`^${routeRegex}$`);
            return regex.test(routePattern);
        }
        
        return route === routePattern;
    });

    if (!hasAccess) {
        return res.status(403).json({
            success: false,
            message: `Vai trò ${userRole} không có quyền truy cập ${routePattern}`
        });
    }

    next();
};

// ===== MIDDLEWARE KIỂM TRA QUYỀN THEO CHỨC NĂNG CỤ THỂ =====

// Quyền quản lý phòng
const canManageRooms = checkResourcePermission('rooms', 'update');
const canCreateRooms = checkResourcePermission('rooms', 'create');
const canDeleteRooms = checkResourcePermission('rooms', 'delete');
const canUpdateRoomPrice = checkResourcePermission('rooms', 'updatePrice');

// Quyền quản lý đặt phòng
const canViewAllBookings = checkResourcePermission('bookings', 'viewAll');
const canConfirmBookings = checkResourcePermission('bookings', 'confirm');
const canCheckIn = checkResourcePermission('bookings', 'checkIn');
const canCheckOut = checkResourcePermission('bookings', 'checkOut');

// Quyền quản lý người dùng
const canManageUsers = checkResourcePermission('users', 'create');
const canDeleteUsers = checkResourcePermission('users', 'delete');
const canAssignRoles = checkResourcePermission('users', 'assignRole');

// Quyền xem báo cáo
const canViewReports = checkResourcePermission('reports', 'revenue');
const canViewDashboard = checkResourcePermission('reports', 'viewDashboard');

// Quyền quản lý dịch vụ
const canManageServices = checkResourcePermission('services', 'create');
const canUpdateServicePrice = checkResourcePermission('services', 'updatePrice');

// ===== FUNCTION GHI LOG HOẠT ĐỘNG =====
const writeActivityLog = async (req, targetId, reason = '', details = '') => {
    try {
        // Chỉ ghi log cho admin và staff
        if (!req.user || req.user.role === 'customer') {
            return;
        }

        await pool.execute(
            'INSERT INTO admin_logs (admin_id, admin_name, action, target_type, target_id, reason, details) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                req.user.id,
                req.user.username || req.user.name,
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
    // Basic auth
    authenticateToken,
    
    // Role-based access
    requireAdmin,
    requireStaff,
    requireCustomer,
    
    // Resource permissions
    checkResourcePermission,
    requireOwnership,
    checkRoutePermission,
    
    // Specific permissions
    canManageRooms,
    canCreateRooms,
    canDeleteRooms,
    canUpdateRoomPrice,
    canViewAllBookings,
    canConfirmBookings,
    canCheckIn,
    canCheckOut,
    canManageUsers,
    canDeleteUsers,
    canAssignRoles,
    canViewReports,
    canViewDashboard,
    canManageServices,
    canUpdateServicePrice,
    
    // Utilities
    writeActivityLog,
    JWT_SECRET
};