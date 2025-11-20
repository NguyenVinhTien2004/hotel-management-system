const express = require('express');
const router = express.Router();
const {
    authenticateToken,
    requireAdmin,
    requireStaff,
    requireCustomer,
    requireOwnership,
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
    writeActivityLog
} = require('../middleware/auth-middleware');

// ===== VÍ DỤ ÁP DỤNG PHÂN QUYỀN TRONG ROUTES =====

// ===== ROUTES CHO KHÁCH HÀNG =====

// Khách hàng xem phòng (không cần đăng nhập)
router.get('/rooms', (req, res) => {
    // Logic xem danh sách phòng
    res.json({ message: 'Danh sách phòng' });
});

// Khách hàng đặt phòng (cần đăng nhập)
router.post('/bookings', authenticateToken, requireCustomer, (req, res) => {
    // Logic đặt phòng
    res.json({ message: 'Đặt phòng thành công' });
});

// Khách hàng xem đơn đặt phòng của mình
router.get('/bookings/my', authenticateToken, requireCustomer, (req, res) => {
    // Logic lấy đơn đặt phòng của khách hàng
    res.json({ message: 'Danh sách đơn đặt phòng của bạn' });
});

// Khách hàng hủy đơn đặt phòng của mình
router.put('/bookings/:id/cancel', 
    authenticateToken, 
    requireCustomer, 
    requireOwnership('booking'), 
    (req, res) => {
        // Logic hủy đơn đặt phòng
        res.json({ message: 'Hủy đơn đặt phòng thành công' });
    }
);

// Khách hàng cập nhật thông tin cá nhân
router.put('/profile/:id', 
    authenticateToken, 
    requireCustomer, 
    requireOwnership('profile'), 
    (req, res) => {
        // Logic cập nhật profile
        res.json({ message: 'Cập nhật thông tin thành công' });
    }
);

// ===== ROUTES CHO NHÂN VIÊN (STAFF) =====

// Nhân viên xem tất cả đơn đặt phòng
router.get('/admin/bookings', authenticateToken, requireStaff, canViewAllBookings, (req, res) => {
    // Logic xem tất cả đơn đặt phòng
    res.json({ message: 'Danh sách tất cả đơn đặt phòng' });
});

// Nhân viên xác nhận đơn đặt phòng
router.put('/admin/bookings/:id/confirm', 
    authenticateToken, 
    requireStaff, 
    canConfirmBookings, 
    async (req, res) => {
        // Logic xác nhận đơn đặt phòng
        await writeActivityLog(req, req.params.id, 'Xác nhận đơn đặt phòng');
        res.json({ message: 'Xác nhận đơn đặt phòng thành công' });
    }
);

// Nhân viên check-in
router.put('/admin/bookings/:id/checkin', 
    authenticateToken, 
    requireStaff, 
    canCheckIn, 
    async (req, res) => {
        // Logic check-in
        await writeActivityLog(req, req.params.id, 'Check-in khách hàng');
        res.json({ message: 'Check-in thành công' });
    }
);

// Nhân viên check-out
router.put('/admin/bookings/:id/checkout', 
    authenticateToken, 
    requireStaff, 
    canCheckOut, 
    async (req, res) => {
        // Logic check-out
        await writeActivityLog(req, req.params.id, 'Check-out khách hàng');
        res.json({ message: 'Check-out thành công' });
    }
);

// Nhân viên cập nhật trạng thái phòng
router.put('/admin/rooms/:id/status', 
    authenticateToken, 
    requireStaff, 
    canManageRooms, 
    async (req, res) => {
        // Logic cập nhật trạng thái phòng
        await writeActivityLog(req, req.params.id, 'Cập nhật trạng thái phòng');
        res.json({ message: 'Cập nhật trạng thái phòng thành công' });
    }
);

// ===== ROUTES CHỈ DÀNH CHO ADMIN =====

// Admin tạo phòng mới
router.post('/admin/rooms', 
    authenticateToken, 
    requireAdmin, 
    canCreateRooms, 
    async (req, res) => {
        // Logic tạo phòng mới
        await writeActivityLog(req, 'new_room', 'Tạo phòng mới');
        res.json({ message: 'Tạo phòng mới thành công' });
    }
);

// Admin xóa phòng
router.delete('/admin/rooms/:id', 
    authenticateToken, 
    requireAdmin, 
    canDeleteRooms, 
    async (req, res) => {
        // Logic xóa phòng
        await writeActivityLog(req, req.params.id, 'Xóa phòng');
        res.json({ message: 'Xóa phòng thành công' });
    }
);

// Admin cập nhật giá phòng
router.put('/admin/rooms/:id/price', 
    authenticateToken, 
    requireAdmin, 
    canUpdateRoomPrice, 
    async (req, res) => {
        // Logic cập nhật giá phòng
        await writeActivityLog(req, req.params.id, 'Cập nhật giá phòng');
        res.json({ message: 'Cập nhật giá phòng thành công' });
    }
);

// Admin quản lý người dùng
router.post('/admin/users', 
    authenticateToken, 
    requireAdmin, 
    canManageUsers, 
    async (req, res) => {
        // Logic tạo người dùng mới
        await writeActivityLog(req, 'new_user', 'Tạo người dùng mới');
        res.json({ message: 'Tạo người dùng thành công' });
    }
);

// Admin xóa người dùng
router.delete('/admin/users/:id', 
    authenticateToken, 
    requireAdmin, 
    canDeleteUsers, 
    async (req, res) => {
        // Logic xóa người dùng
        await writeActivityLog(req, req.params.id, 'Xóa người dùng');
        res.json({ message: 'Xóa người dùng thành công' });
    }
);

// Admin gán vai trò
router.put('/admin/users/:id/role', 
    authenticateToken, 
    requireAdmin, 
    canAssignRoles, 
    async (req, res) => {
        // Logic gán vai trò
        await writeActivityLog(req, req.params.id, 'Gán vai trò người dùng');
        res.json({ message: 'Gán vai trò thành công' });
    }
);

// Admin xem báo cáo doanh thu
router.get('/admin/reports/revenue', 
    authenticateToken, 
    requireAdmin, 
    canViewReports, 
    (req, res) => {
        // Logic xem báo cáo doanh thu
        res.json({ message: 'Báo cáo doanh thu' });
    }
);

// Admin quản lý dịch vụ
router.post('/admin/services', 
    authenticateToken, 
    requireAdmin, 
    canManageServices, 
    async (req, res) => {
        // Logic tạo dịch vụ mới
        await writeActivityLog(req, 'new_service', 'Tạo dịch vụ mới');
        res.json({ message: 'Tạo dịch vụ thành công' });
    }
);

// ===== ROUTES CHUNG (ADMIN + STAFF) =====

// Xem dashboard (admin + staff)
router.get('/admin/dashboard', 
    authenticateToken, 
    requireStaff, 
    canViewDashboard, 
    (req, res) => {
        // Logic hiển thị dashboard
        res.json({ message: 'Dashboard data' });
    }
);

// ===== MIDDLEWARE XỬ LÝ LỖI =====
router.use((error, req, res, next) => {
    console.error('Route error:', error);
    res.status(500).json({
        success: false,
        message: 'Lỗi server'
    });
});

module.exports = router;

// ===== HƯỚNG DẪN SỬ DỤNG =====
/*
1. Import middleware cần thiết từ auth-middleware.js
2. Áp dụng middleware theo thứ tự:
   - authenticateToken (kiểm tra đăng nhập)
   - requireRole (kiểm tra vai trò)
   - canDoAction (kiểm tra quyền cụ thể)
   - requireOwnership (kiểm tra quyền sở hữu nếu cần)

3. Ví dụ cấu trúc middleware:
   router.method('/path/:id', 
       authenticateToken,        // Bắt buộc đăng nhập
       requireAdmin,            // Chỉ admin
       canDeleteRooms,          // Có quyền xóa phòng
       requireOwnership('room'), // Kiểm tra sở hữu (nếu cần)
       async (req, res) => {
           // Logic xử lý
           await writeActivityLog(req, req.params.id, 'Mô tả hành động');
           res.json({ success: true });
       }
   );

4. Ghi log hoạt động:
   - Chỉ ghi log cho admin và staff
   - Gọi writeActivityLog() sau khi thực hiện hành động thành công
   - Cung cấp mô tả rõ ràng về hành động

5. Xử lý lỗi:
   - Middleware tự động trả về lỗi 401 (chưa đăng nhập)
   - Middleware tự động trả về lỗi 403 (không có quyền)
   - Xử lý lỗi 500 trong catch block
*/