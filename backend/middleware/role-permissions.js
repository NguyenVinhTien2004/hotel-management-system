// ===== HỆ THỐNG PHÂN QUYỀN CHI TIẾT =====
// Dựa trên yêu cầu phân quyền rõ ràng cho khách hàng và admin/nhân viên

const ROLE_PERMISSIONS = {
    // ===== QUYỀN KHÁCH HÀNG (CUSTOMER) =====
    customer: {
        // 1. Quyền Đăng ký – Đăng nhập
        auth: {
            register: true,           // Tạo tài khoản
            login: true,             // Đăng nhập
            logout: true,            // Đăng xuất
            verifyEmail: true,       // Xác minh email
            updateProfile: true      // Cập nhật thông tin cá nhân
        },

        // 2. Quyền Tìm kiếm & Xem phòng
        rooms: {
            search: true,            // Tìm kiếm phòng theo ngày
            filter: true,            // Lọc theo loại phòng, giá, tiện ích
            viewDetails: true,       // Xem chi tiết phòng, hình ảnh, mô tả
            viewPolicies: true,      // Xem chính sách
            create: false,           // ❌ Không tạo phòng
            update: false,           // ❌ Không sửa phòng
            delete: false,           // ❌ Không xóa phòng
            updatePrice: false,      // ❌ Không sửa giá
            updateStatus: false      // ❌ Không sửa trạng thái
        },

        // 3. Quyền Đặt phòng
        bookings: {
            create: true,            // Tạo đơn đặt phòng
            confirmInfo: true,       // Xác nhận thông tin đặt phòng
            payment: true,           // Thanh toán
            receiveNotification: true, // Nhận email/sms thông báo
            viewOwn: true,           // Xem đơn của mình
            cancelOwn: true,         // Hủy đơn của mình (trong thời hạn)
            requestChange: true,     // Yêu cầu thay đổi ngày, loại phòng
            viewAll: false,          // ❌ Không xem đơn của người khác
            confirmBooking: false,   // ❌ Không xác nhận đơn
            checkIn: false,          // ❌ Không check-in
            checkOut: false,         // ❌ Không check-out
            updateStatus: false      // ❌ Không sửa trạng thái đơn
        },

        // 4. Quyền Quản lý Đơn Đặt Phòng Của Chính Mình
        myBookings: {
            viewAll: true,           // Xem tất cả đơn của bản thân
            viewStatus: true,        // Xem trạng thái: Pending/Confirmed/Cancelled/Completed
            cancel: true,            // ✅ Hủy đặt phòng (khi đặt lộn hoặc có trục trặc)
            requestModification: true // Yêu cầu thay đổi
        },

        // 5. Quyền Hỗ trợ
        support: {
            sendRequest: true,       // Gửi yêu cầu hỗ trợ
            sendFeedback: true,      // Gửi feedback
            chat: true              // Chat với lễ tân/CSKH
        },

        // ❌ NHỮNG QUYỀN KHÁCH HÀNG KHÔNG CÓ
        admin: {
            accessDashboard: false,  // ❌ Không truy cập trang quản trị
            viewReports: false,      // ❌ Không xem báo cáo, thống kê
            manageUsers: false,      // ❌ Không quản lý người dùng
            manageRooms: false,      // ❌ Không quản lý phòng
            manageServices: false,   // ❌ Không quản lý dịch vụ
            viewOthersData: false    // ❌ Không xem dữ liệu người khác
        }
    },

    // ===== QUYỀN ADMIN (TOÀN QUYỀN) =====
    admin: {
        // 1. Quản lý Người Dùng
        users: {
            viewAll: true,           // Xem danh sách tất cả người dùng
            create: true,            // Tạo tài khoản nhân viên
            update: true,            // Cập nhật thông tin người dùng
            delete: true,            // Xóa người dùng
            lockUnlock: true,        // Khóa / mở khóa tài khoản
            assignRole: true         // Gán vai trò (roles) cho người dùng
        },

        // 2. Quản lý Phòng (Rooms)
        rooms: {
            create: true,            // Thêm phòng
            update: true,            // Sửa thông tin phòng
            delete: true,            // Xóa phòng
            updatePrice: true,       // Cập nhật giá phòng
            updateStatus: true,      // Cập nhật tình trạng phòng
            manageAmenities: true,   // Quản lý tiện ích
            manageTypes: true,       // Quản lý loại phòng
            viewAll: true,           // Xem tất cả phòng
            search: true,            // Tìm kiếm phòng
            filter: true             // Lọc phòng
        },

        // 3. Quản lý Đặt Phòng (Bookings)
        bookings: {
            viewAll: true,           // Xem tất cả đơn đặt phòng
            create: true,            // Tạo đơn đặt phòng
            update: true,            // Chỉnh sửa đơn đặt phòng
            delete: true,            // Xóa đơn đặt phòng
            confirm: true,           // Xác nhận đơn
            cancel: true,            // Hủy đơn
            checkIn: true,           // Check-in
            checkOut: true,          // Check-out
            assignRoom: true,        // Gán phòng cho khách
            checkPayment: true,      // Kiểm tra tình trạng thanh toán
            updateStatus: true       // Cập nhật trạng thái đơn
        },

        // 4. Quản lý Thanh Toán
        payments: {
            viewHistory: true,       // Xem lịch sử thanh toán
            updateStatus: true,      // Cập nhật trạng thái thanh toán
            generateInvoice: true,   // Xuất hóa đơn
            processRefund: true,     // Quản lý hoàn tiền (refund)
            viewAll: true           // Xem tất cả giao dịch
        },

        // 5. Quản lý Role – Permission
        rolePermissions: {
            createRole: true,        // Tạo role mới (manager, staff, customer,...)
            createPermission: true,  // Tạo permission mới
            assignPermission: true,  // Gán quyền cho role
            revokePermission: true,  // Cấm quyền
            viewRoles: true,         // Xem tất cả roles
            updateRoles: true        // Cập nhật roles
        },

        // 6. Quản lý Thống kê – Báo cáo
        reports: {
            revenue: true,           // Thống kê doanh thu theo ngày/tháng/năm
            bookingStats: true,      // Số lượng đặt phòng
            occupancyRate: true,     // Tỷ lệ lấp phòng
            roomTypeReport: true,    // Báo cáo theo loại phòng
            customerReport: true,    // Báo cáo khách hàng
            exportData: true,        // Xuất dữ liệu
            viewDashboard: true      // Xem dashboard
        },

        // 7. Quản lý Dịch vụ
        services: {
            create: true,            // Tạo dịch vụ
            update: true,            // Sửa dịch vụ
            delete: true,            // Xóa dịch vụ
            updatePrice: true,       // Cập nhật giá dịch vụ
            viewAll: true,           // Xem tất cả dịch vụ
            manageRatings: true      // Quản lý đánh giá dịch vụ
        },

        // 8. Quản lý Hệ thống
        system: {
            viewLogs: true,          // Xem log hoạt động
            backup: true,            // Sao lưu dữ liệu
            maintenance: true,       // Bảo trì hệ thống
            configSettings: true     // Cấu hình hệ thống
        }
    },

    // ===== QUYỀN NHÂN VIÊN (STAFF) =====
    staff: {
        // Kế thừa một số quyền của admin nhưng bị hạn chế
        
        // 1. Quản lý Người Dùng (Hạn chế)
        users: {
            viewAll: true,           // Xem danh sách người dùng
            create: false,           // ❌ Không tạo tài khoản nhân viên
            update: true,            // Cập nhật thông tin khách hàng
            delete: false,           // ❌ Không xóa người dùng
            lockUnlock: false,       // ❌ Không khóa/mở khóa tài khoản
            assignRole: false        // ❌ Không gán vai trò
        },

        // 2. Quản lý Phòng (Hạn chế)
        rooms: {
            create: false,           // ❌ Không thêm phòng
            update: true,            // Sửa thông tin phòng (hạn chế)
            delete: false,           // ❌ Không xóa phòng
            updatePrice: false,      // ❌ Không cập nhật giá
            updateStatus: true,      // Cập nhật tình trạng phòng
            manageAmenities: false,  // ❌ Không quản lý tiện ích
            manageTypes: false,      // ❌ Không quản lý loại phòng
            viewAll: true,           // Xem tất cả phòng
            search: true,            // Tìm kiếm phòng
            filter: true             // Lọc phòng
        },

        // 3. Quản lý Đặt Phòng (Đầy đủ)
        bookings: {
            viewAll: true,           // Xem tất cả đơn đặt phòng
            create: true,            // Tạo đơn đặt phòng
            update: true,            // Chỉnh sửa đơn đặt phòng
            delete: false,           // ❌ Không xóa đơn
            confirm: true,           // Xác nhận đơn
            cancel: true,            // Hủy đơn
            checkIn: true,           // Check-in
            checkOut: true,          // Check-out
            assignRoom: true,        // Gán phòng cho khách
            checkPayment: true,      // Kiểm tra tình trạng thanh toán
            updateStatus: true       // Cập nhật trạng thái đơn
        },

        // 4. Quản lý Thanh Toán (Hạn chế)
        payments: {
            viewHistory: true,       // Xem lịch sử thanh toán
            updateStatus: true,      // Cập nhật trạng thái thanh toán
            generateInvoice: true,   // Xuất hóa đơn
            processRefund: false,    // ❌ Không quản lý hoàn tiền
            viewAll: true           // Xem tất cả giao dịch
        },

        // 5. Quản lý Role – Permission (Không có)
        rolePermissions: {
            createRole: false,       // ❌ Không tạo role
            createPermission: false, // ❌ Không tạo permission
            assignPermission: false, // ❌ Không gán quyền
            revokePermission: false, // ❌ Không cấm quyền
            viewRoles: false,        // ❌ Không xem roles
            updateRoles: false       // ❌ Không cập nhật roles
        },

        // 6. Quản lý Thống kê – Báo cáo (Hạn chế)
        reports: {
            revenue: false,          // ❌ Không xem doanh thu
            bookingStats: true,      // Số lượng đặt phòng
            occupancyRate: true,     // Tỷ lệ lấp phòng
            roomTypeReport: true,    // Báo cáo theo loại phòng
            customerReport: true,    // Báo cáo khách hàng
            exportData: false,       // ❌ Không xuất dữ liệu
            viewDashboard: true      // Xem dashboard (hạn chế)
        },

        // 7. Quản lý Dịch vụ (Chỉ xem)
        services: {
            create: false,           // ❌ Không tạo dịch vụ
            update: false,           // ❌ Không sửa dịch vụ
            delete: false,           // ❌ Không xóa dịch vụ
            updatePrice: false,      // ❌ Không cập nhật giá
            viewAll: true,           // Xem tất cả dịch vụ
            manageRatings: false     // ❌ Không quản lý đánh giá
        },

        // 8. Quản lý Hệ thống (Không có)
        system: {
            viewLogs: false,         // ❌ Không xem log
            backup: false,           // ❌ Không sao lưu
            maintenance: false,      // ❌ Không bảo trì
            configSettings: false    // ❌ Không cấu hình
        }
    }
};

// ===== FUNCTION KIỂM TRA QUYỀN =====
const hasPermission = (userRole, resource, action) => {
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    if (!rolePermissions) {
        return false;
    }

    const resourcePermissions = rolePermissions[resource];
    if (!resourcePermissions) {
        return false;
    }

    return resourcePermissions[action] === true;
};

// ===== MIDDLEWARE KIỂM TRA QUYỀN =====
const checkPermission = (resource, action) => {
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
const checkOwnership = (req, res, next) => {
    // Chỉ khách hàng cần kiểm tra quyền sở hữu
    if (req.user.role === 'customer') {
        // Logic kiểm tra xem tài nguyên có thuộc về user không
        // Ví dụ: kiểm tra booking có thuộc về customer không
        const userId = req.user.id;
        const resourceId = req.params.id;
        
        // Thực hiện kiểm tra trong database...
        // Nếu không phải của user thì return 403
    }
    
    // Admin và staff có thể truy cập tất cả
    next();
};

// ===== DANH SÁCH ROUTE ĐƯỢC PHÉP TRUY CẬP =====
const ALLOWED_ROUTES = {
    customer: [
        // Auth routes
        'POST /api/auth/register',
        'POST /api/auth/login',
        'POST /api/auth/logout',
        'POST /api/auth/verify-email',
        'PUT /api/auth/profile',
        
        // Room routes
        'GET /api/rooms',
        'GET /api/rooms/:id',
        'GET /api/rooms/search',
        
        // Booking routes (own only)
        'GET /api/bookings/my',
        'POST /api/bookings',
        'PUT /api/bookings/:id/cancel',  // ✅ Quyền hủy phòng của mình
        'DELETE /api/bookings/:id/cancel', // ✅ Quyền hủy phòng (backup route)
        'GET /api/bookings/:id',
        
        // Service routes
        'GET /api/services',
        'GET /api/services/:id',
        
        // Support routes
        'POST /api/feedback',
        'POST /api/support/request',
        'GET /api/support/chat'
    ],
    
    staff: [
        // Tất cả routes của customer
        ...ALLOWED_ROUTES?.customer || [],
        
        // Additional staff routes
        'GET /api/admin/dashboard',
        'GET /api/admin/bookings',
        'PUT /api/admin/bookings/:id/status',
        'PUT /api/admin/bookings/:id/checkin',
        'PUT /api/admin/bookings/:id/checkout',
        'GET /api/admin/customers',
        'PUT /api/admin/customers/:id',
        'GET /api/admin/rooms/status',
        'PUT /api/admin/rooms/:id/status',
        'GET /api/admin/invoices',
        'POST /api/admin/invoices',
        'GET /api/admin/reports/bookings',
        'GET /api/admin/reports/occupancy'
    ],
    
    admin: [
        // Tất cả routes (wildcard)
        '*'
    ]
};

module.exports = {
    ROLE_PERMISSIONS,
    hasPermission,
    checkPermission,
    checkOwnership,
    ALLOWED_ROUTES
};