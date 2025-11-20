# Hướng dẫn chuyển từ JSON sang MySQL

## 1. Chuẩn bị MySQL

Đảm bảo MySQL đang chạy với thông tin:
- Host: localhost
- User: root  
- Password: 123456789@
- Database: quanlykhachsan (sẽ được tạo tự động)

## 2. Cài đặt dependencies

```bash
cd backend
npm install
```

## 3. Migrate dữ liệu từ JSON sang MySQL

```bash
npm run migrate
```

Script này sẽ:
- Tạo database `quanlykhachsan` nếu chưa có
- Tạo tất cả các bảng cần thiết
- Migrate toàn bộ dữ liệu từ `data.json` sang MySQL
- Backup file JSON gốc

## 4. Chạy server với MySQL

```bash
# Production
npm run start:mysql

# Development (auto-reload)
npm run dev:mysql
```

## 5. Kiểm tra

Server sẽ chạy trên http://localhost:3000 và sử dụng MySQL thay vì JSON file.

## Cấu trúc Database

### Bảng chính:
- `users` - Tài khoản người dùng
- `rooms` - Thông tin phòng
- `customers` - Thông tin khách hàng  
- `bookings` - Đặt phòng
- `services` - Dịch vụ khách sạn
- `feedback` - Đánh giá từ khách hàng
- `invoices` - Hóa đơn
- `invoice_services` - Dịch vụ trong hóa đơn
- `admin_logs` - Nhật ký hoạt động admin

## Rollback về JSON

Nếu muốn quay lại sử dụng JSON:
```bash
npm run start    # hoặc npm run dev
```

File JSON gốc được backup với tên `data-backup-[timestamp].json`