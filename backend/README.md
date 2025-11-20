# Hệ thống quản lý khách sạn - Backend

## Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình MySQL
Đảm bảo MySQL đang chạy với thông tin:
- Host: localhost
- User: root  
- Password: 123456789@
- Database: quanlykhachsan (sẽ được tạo tự động)

### 3. Chạy server
```bash
# Production
npm start

# Development (auto-reload)
npm run dev
```

Server sẽ:
- Tự động kết nối MySQL
- Tạo database và tables nếu chưa có
- Thêm dữ liệu mẫu
- Chạy trên http://localhost:3000

### 4. Migrate dữ liệu từ JSON (nếu có)
Nếu bạn có dữ liệu trong file `data.json`:
```bash
npm run migrate
```

## Tính năng

### API Endpoints:
- **Auth**: `/api/auth/login`, `/api/auth/register`, `/api/auth/admin-login`
- **Rooms**: `/api/rooms` - Quản lý phòng
- **Bookings**: `/api/bookings` - Đặt phòng
- **Customers**: `/api/customers` - Khách hàng
- **Services**: `/api/services` - Dịch vụ
- **Feedback**: `/api/feedback` - Đánh giá
- **Admin**: `/api/admin/*` - Quản lý admin

### Database Schema:
- `users` - Tài khoản người dùng
- `rooms` - Thông tin phòng
- `customers` - Thông tin khách hàng  
- `bookings` - Đặt phòng
- `services` - Dịch vụ khách sạn
- `feedback` - Đánh giá từ khách hàng
- `invoices` - Hóa đơn
- `invoice_services` - Dịch vụ trong hóa đơn
- `admin_logs` - Nhật ký hoạt động admin

## Tài khoản mặc định
- **Admin**: Bất kỳ username nào với password `@`
- **Customer**: Đăng ký tài khoản mới qua `/api/auth/register`

## Troubleshooting

Nếu gặp lỗi kết nối MySQL:
1. Kiểm tra MySQL đã chạy chưa
2. Kiểm tra thông tin kết nối trong `database.js`
3. Đảm bảo user `root` có quyền tạo database