// Định nghĩa các quyền hạn chi tiết cho từng vai trò

const PERMISSIONS = {
    // Quyền của Admin
    ADMIN: {
        // Quản lý phòng
        rooms: {
            create: true,
            read: true,
            update: true,
            delete: true,
            changeStatus: true
        },
        // Quản lý đặt phòng
        bookings: {
            create: true,
            read: true,
            update: true,
            delete: true,
            confirm: true,
            cancel: true,
            checkIn: true,
            checkOut: true
        },
        // Quản lý khách hàng
        customers: {
            create: true,
            read: true,
            update: true,
            delete: true,
            viewAll: true
        },
        // Quản lý dịch vụ
        services: {
            create: true,
            read: true,
            update: true,
            delete: true
        },
        // Quản lý hóa đơn
        invoices: {
            create: true,
            read: true,
            update: true,
            delete: true,
            viewAll: true
        },
        // Quản lý feedback
        feedback: {
            read: true,
            delete: true,
            viewAll: true
        },
        // Quản lý nhân viên
        staff: {
            create: true,
            read: true,
            update: true,
            delete: true
        },
        // Xem báo cáo và thống kê
        reports: {
            revenue: true,
            bookings: true,
            customers: true,
            rooms: true
        },
        // Xem log hoạt động
        logs: {
            view: true,
            export: true
        }
    },

    // Quyền của Staff (Nhân viên)
    STAFF: {
        // Quản lý phòng (hạn chế)
        rooms: {
            create: false,
            read: true,
            update: true,
            delete: false,
            changeStatus: true
        },
        // Quản lý đặt phòng
        bookings: {
            create: true,
            read: true,
            update: true,
            delete: false,
            confirm: true,
            cancel: true,
            checkIn: true,
            checkOut: true
        },
        // Quản lý khách hàng (hạn chế)
        customers: {
            create: true,
            read: true,
            update: true,
            delete: false,
            viewAll: true
        },
        // Quản lý dịch vụ (hạn chế)
        services: {
            create: false,
            read: true,
            update: false,
            delete: false
        },
        // Quản lý hóa đơn
        invoices: {
            create: true,
            read: true,
            update: true,
            delete: false,
            viewAll: true
        },
        // Quản lý feedback
        feedback: {
            read: true,
            delete: false,
            viewAll: true
        },
        // Không thể quản lý nhân viên
        staff: {
            create: false,
            read: false,
            update: false,
            delete: false
        },
        // Xem báo cáo cơ bản
        reports: {
            revenue: false,
            bookings: true,
            customers: true,
            rooms: true
        },
        // Không xem được log
        logs: {
            view: false,
            export: false
        }
    },

    // Quyền của Customer (Khách hàng)
    CUSTOMER: {
        // Xem phòng
        rooms: {
            create: false,
            read: true,
            update: false,
            delete: false,
            changeStatus: false
        },
        // Quản lý đặt phòng của mình
        bookings: {
            create: true,
            read: true, // Chỉ của mình
            update: false,
            delete: false,
            confirm: false,
            cancel: true, // Chỉ hủy của mình
            checkIn: false,
            checkOut: false
        },
        // Quản lý thông tin cá nhân
        customers: {
            create: false,
            read: true, // Chỉ của mình
            update: true, // Chỉ của mình
            delete: false,
            viewAll: false
        },
        // Xem dịch vụ
        services: {
            create: false,
            read: true,
            update: false,
            delete: false
        },
        // Xem hóa đơn của mình
        invoices: {
            create: false,
            read: true, // Chỉ của mình
            update: false,
            delete: false,
            viewAll: false
        },
        // Tạo feedback
        feedback: {
            create: true,
            read: true, // Chỉ của mình
            delete: false,
            viewAll: false
        },
        // Không thể quản lý nhân viên
        staff: {
            create: false,
            read: false,
            update: false,
            delete: false
        },
        // Không xem báo cáo
        reports: {
            revenue: false,
            bookings: false,
            customers: false,
            rooms: false
        },
        // Không xem log
        logs: {
            view: false,
            export: false
        }
    }
};

// Function kiểm tra quyền
const hasPermission = (userRole, resource, action) => {
    const rolePermissions = PERMISSIONS[userRole.toUpperCase()];
    if (!rolePermissions) {
        return false;
    }

    const resourcePermissions = rolePermissions[resource];
    if (!resourcePermissions) {
        return false;
    }

    return resourcePermissions[action] === true;
};

// Middleware kiểm tra quyền cụ thể
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
                message: `Bạn không có quyền ${action} ${resource}`
            });
        }

        next();
    };
};

// Danh sách các route được phép truy cập theo vai trò
const ROUTE_PERMISSIONS = {
    // Routes cho Admin
    admin: [
        'GET /api/admin/*',
        'POST /api/admin/*',
        'PUT /api/admin/*',
        'DELETE /api/admin/*',
        'GET /api/dashboard/stats',
        'GET /api/rooms',
        'POST /api/rooms',
        'PUT /api/rooms/*',
        'DELETE /api/rooms/*',
        'GET /api/bookings',
        'PUT /api/bookings/*/status',
        'GET /api/customers',
        'POST /api/customers',
        'DELETE /api/customers/*',
        'GET /api/services',
        'POST /api/services',
        'PUT /api/services/*',
        'DELETE /api/services/*'
    ],

    // Routes cho Staff
    staff: [
        'GET /api/dashboard/stats',
        'GET /api/rooms',
        'PUT /api/rooms/*/status',
        'GET /api/bookings',
        'PUT /api/bookings/*/status',
        'GET /api/customers',
        'POST /api/customers',
        'GET /api/services',
        'GET /api/admin/invoices',
        'POST /api/admin/invoices',
        'PUT /api/admin/invoices/*',
        'GET /api/admin/feedback'
    ],

    // Routes cho Customer
    customer: [
        'GET /api/dashboard/stats',
        'GET /api/rooms',
        'GET /api/bookings', // Chỉ của mình
        'POST /api/bookings',
        'PUT /api/bookings/*/status', // Chỉ hủy của mình
        'GET /api/services',
        'POST /api/feedback',
        'GET /api/notifications',
        'PUT /api/profile/*'
    ]
};

// Function kiểm tra route permission
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

    const allowedRoutes = ROUTE_PERMISSIONS[userRole] || [];
    
    // Kiểm tra exact match hoặc wildcard match
    const hasAccess = allowedRoutes.some(route => {
        if (route.includes('*')) {
            const pattern = route.replace('*', '.*');
            const regex = new RegExp(`^${pattern}$`);
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

module.exports = {
    PERMISSIONS,
    hasPermission,
    checkResourcePermission,
    checkRoutePermission,
    ROUTE_PERMISSIONS
};