# HƯỚNG DẪN TÍCH HỢP HỆ THỐNG PHÂN QUYỀN

## 📋 TỔNG QUAN

Hệ thống phân quyền được thiết kế với 3 vai trò chính:
- **Customer (Khách hàng)**: Quyền hạn chế, chỉ quản lý dữ liệu của mình
- **Staff (Nhân viên)**: Quyền trung bình, xử lý đặt phòng và khách hàng
- **Admin (Quản trị viên)**: Toàn quyền quản lý hệ thống

## 🗂️ CẤU TRÚC FILE

```
backend/middleware/
├── role-permissions.js      # Định nghĩa quyền chi tiết cho từng vai trò
├── auth-middleware.js       # Middleware xác thực và phân quyền
└── protected-routes-example.js  # Ví dụ áp dụng phân quyền
```

## 🔧 CÁCH TÍCH HỢP VÀO SERVER HIỆN TẠI

### Bước 1: Cập nhật server.js

```javascript
// Thêm vào đầu file server.js
const {
    authenticateToken,
    requireAdmin,
    requireStaff,
    requireCustomer,
    requireOwnership,
    canManageRooms,
    canViewAllBookings,
    writeActivityLog
} = require('./middleware/auth-middleware');

// Áp dụng middleware cho các routes
```

### Bước 2: Áp dụng phân quyền cho routes hiện tại

#### Routes cho KHÁCH HÀNG:
```javascript
// Xem phòng (không cần đăng nhập)
app.get('/api/rooms', (req, res) => { /* logic */ });

// Đặt phòng (cần đăng nhập)
app.post('/api/bookings', authenticateToken, requireCustomer, (req, res) => {
    // Logic đặt phòng
});

// Xem đơn đặt phòng của mình
app.get('/api/bookings/my', authenticateToken, requireCustomer, (req, res) => {
    // Chỉ lấy đơn của user hiện tại
});

// Hủy đơn đặt phòng của mình
app.put('/api/bookings/:id/cancel', 
    authenticateToken, 
    requireCustomer, 
    requireOwnership('booking'), 
    (req, res) => {
        // Logic hủy đơn
    }
);
```

#### Routes cho NHÂN VIÊN:
```javascript
// Xem tất cả đơn đặt phòng
app.get('/api/admin/bookings', 
    authenticateToken, 
    requireStaff, 
    canViewAllBookings, 
    (req, res) => {
        // Logic xem tất cả đơn
    }
);

// Xác nhận đơn đặt phòng
app.put('/api/admin/bookings/:id/confirm', 
    authenticateToken, 
    requireStaff, 
    async (req, res) => {
        // Logic xác nhận
        await writeActivityLog(req, req.params.id, 'Xác nhận đơn đặt phòng');
    }
);

// Check-in/Check-out
app.put('/api/admin/bookings/:id/checkin', authenticateToken, requireStaff, async (req, res) => {
    // Logic check-in
    await writeActivityLog(req, req.params.id, 'Check-in khách hàng');
});
```

#### Routes cho ADMIN:
```javascript
// Quản lý phòng
app.post('/api/admin/rooms', authenticateToken, requireAdmin, canCreateRooms, async (req, res) => {
    // Logic tạo phòng
    await writeActivityLog(req, 'new_room', 'Tạo phòng mới');
});

app.delete('/api/admin/rooms/:id', authenticateToken, requireAdmin, async (req, res) => {
    // Logic xóa phòng
    await writeActivityLog(req, req.params.id, 'Xóa phòng');
});

// Quản lý người dùng
app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    // Logic tạo user
    await writeActivityLog(req, 'new_user', 'Tạo người dùng mới');
});

// Xem báo cáo
app.get('/api/admin/reports/revenue', authenticateToken, requireAdmin, (req, res) => {
    // Logic báo cáo doanh thu
});
```

## 📊 BẢNG PHÂN QUYỀN CHI TIẾT

| Chức năng | Customer | Staff | Admin |
|-----------|----------|-------|-------|
| **Quản lý tài khoản** |
| Đăng ký/Đăng nhập | ✅ | ✅ | ✅ |
| Cập nhật profile | ✅ (của mình) | ✅ | ✅ |
| Xóa tài khoản | ❌ | ❌ | ✅ |
| **Quản lý phòng** |
| Xem phòng | ✅ | ✅ | ✅ |
| Tạo phòng | ❌ | ❌ | ✅ |
| Sửa phòng | ❌ | ✅ (hạn chế) | ✅ |
| Xóa phòng | ❌ | ❌ | ✅ |
| Cập nhật giá | ❌ | ❌ | ✅ |
| Cập nhật trạng thái | ❌ | ✅ | ✅ |
| **Quản lý đặt phòng** |
| Đặt phòng | ✅ | ✅ | ✅ |
| Xem đơn của mình | ✅ | ✅ | ✅ |
| Xem tất cả đơn | ❌ | ✅ | ✅ |
| Hủy đơn của mình | ✅ | ✅ | ✅ |
| Xác nhận đơn | ❌ | ✅ | ✅ |
| Check-in/Check-out | ❌ | ✅ | ✅ |
| **Quản lý dịch vụ** |
| Xem dịch vụ | ✅ | ✅ | ✅ |
| Tạo dịch vụ | ❌ | ❌ | ✅ |
| Sửa dịch vụ | ❌ | ❌ | ✅ |
| Xóa dịch vụ | ❌ | ❌ | ✅ |
| **Báo cáo & Thống kê** |
| Xem dashboard | ❌ | ✅ (hạn chế) | ✅ |
| Báo cáo doanh thu | ❌ | ❌ | ✅ |
| Thống kê đặt phòng | ❌ | ✅ | ✅ |
| Xuất dữ liệu | ❌ | ❌ | ✅ |

## 🔒 CÁC MIDDLEWARE QUAN TRỌNG

### 1. Xác thực cơ bản
```javascript
authenticateToken          // Kiểm tra đăng nhập
requireAdmin              // Chỉ admin
requireStaff              // Admin + staff
requireCustomer           // Chỉ customer
```

### 2. Kiểm tra quyền cụ thể
```javascript
canManageRooms           // Quyền quản lý phòng
canCreateRooms           // Quyền tạo phòng
canDeleteRooms           // Quyền xóa phòng
canViewAllBookings       // Quyền xem tất cả đơn
canConfirmBookings       // Quyền xác nhận đơn
canManageUsers           // Quyền quản lý user
canViewReports           // Quyền xem báo cáo
```

### 3. Kiểm tra quyền sở hữu
```javascript
requireOwnership('booking')   // Kiểm tra đơn có thuộc về user
requireOwnership('profile')   // Kiểm tra profile có thuộc về user
requireOwnership('feedback')  // Kiểm tra feedback có thuộc về user
```

## 📝 CÁCH SỬ DỤNG TRONG CODE

### Ví dụ 1: Route đơn giản
```javascript
app.get('/api/rooms', (req, res) => {
    // Không cần middleware - ai cũng xem được
});
```

### Ví dụ 2: Route cần đăng nhập
```javascript
app.post('/api/bookings', authenticateToken, requireCustomer, (req, res) => {
    // Chỉ customer đã đăng nhập mới đặt được phòng
});
```

### Ví dụ 3: Route cần quyền cụ thể
```javascript
app.post('/api/admin/rooms', 
    authenticateToken,     // Phải đăng nhập
    requireAdmin,          // Phải là admin
    canCreateRooms,        // Phải có quyền tạo phòng
    async (req, res) => {
        // Logic tạo phòng
        await writeActivityLog(req, 'new_room', 'Tạo phòng mới');
        res.json({ success: true });
    }
);
```

### Ví dụ 4: Route cần kiểm tra sở hữu
```javascript
app.put('/api/bookings/:id/cancel', 
    authenticateToken,              // Phải đăng nhập
    requireCustomer,                // Phải là customer
    requireOwnership('booking'),    // Phải là đơn của mình
    (req, res) => {
        // Logic hủy đơn
    }
);
```

## 🚀 TRIỂN KHAI

### Bước 1: Backup code hiện tại
```bash
copy server.js server-backup.js
```

### Bước 2: Tích hợp middleware
1. Import các middleware cần thiết
2. Áp dụng cho từng route theo bảng phân quyền
3. Thêm ghi log cho các hành động quan trọng

### Bước 3: Test phân quyền
1. Test với tài khoản customer
2. Test với tài khoản staff  
3. Test với tài khoản admin
4. Kiểm tra các trường hợp edge case

### Bước 4: Cập nhật frontend
1. Ẩn/hiện các nút theo quyền user
2. Xử lý lỗi 403 (không có quyền)
3. Redirect user đến trang phù hợp

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Luôn kiểm tra quyền ở backend**: Frontend chỉ để UX, không phải bảo mật
2. **Ghi log các hành động quan trọng**: Để audit và debug
3. **Xử lý lỗi gracefully**: Trả về message rõ ràng cho user
4. **Test kỹ các edge case**: Đặc biệt là quyền sở hữu tài nguyên
5. **Backup trước khi deploy**: Để rollback nếu có lỗi

## 🔧 TROUBLESHOOTING

### Lỗi 401 (Unauthorized)
- Kiểm tra token có được gửi đúng không
- Kiểm tra token có hết hạn không

### Lỗi 403 (Forbidden)  
- Kiểm tra role của user
- Kiểm tra quyền cụ thể cho hành động
- Kiểm tra quyền sở hữu tài nguyên

### Lỗi 500 (Server Error)
- Kiểm tra database connection
- Kiểm tra log để debug
- Kiểm tra middleware có được import đúng không

## 📞 HỖ TRỢ

Nếu gặp vấn đề khi tích hợp, hãy:
1. Kiểm tra console log
2. Test từng middleware riêng lẻ
3. So sánh với file example
4. Đọc kỹ error message