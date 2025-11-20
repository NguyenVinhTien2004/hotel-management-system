# TÍNH NĂNG ĐÁNH GIÁ CHẤT LƯỢNG DỊCH VỤ

## Mô tả
Thêm tính năng đánh giá chất lượng dịch vụ vào form đánh giá hiện có. Tính năng này sẽ:

- **Hiển thị có điều kiện**: Chỉ hiển thị phần đánh giá dịch vụ khi khách hàng có đặt dịch vụ
- **Đánh giá từng dịch vụ**: Khách hàng có thể đánh giá riêng từng dịch vụ đã sử dụng
- **Lưu trữ riêng biệt**: Đánh giá dịch vụ được lưu trong bảng `service_ratings` riêng

## Cách hoạt động

### 1. Khi khách hàng KHÔNG đặt dịch vụ:
- Form chỉ hiển thị đánh giá phòng và nhân viên như cũ
- Không có phần đánh giá dịch vụ

### 2. Khi khách hàng CÓ đặt dịch vụ:
- Form hiển thị thêm phần "Chất lượng dịch vụ"
- Liệt kê từng dịch vụ đã đặt với:
  - Tên dịch vụ và giá
  - 5 sao đánh giá
  - Ô nhận xét riêng cho từng dịch vụ

## Cấu trúc Database

### Bảng `service_ratings`
```sql
CREATE TABLE service_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    booking_id INT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng `invoice_services` (đã có)
Sử dụng để lấy danh sách dịch vụ đã đặt của khách hàng.

## API Endpoints

### 1. Lấy dịch vụ đã đặt
```
GET /api/bookings/:id/services
```
Trả về danh sách dịch vụ mà khách hàng đã đặt trong booking.

### 2. Tạo đánh giá dịch vụ
```
POST /api/service-ratings
```
Lưu đánh giá cho từng dịch vụ cụ thể.

### 3. Lấy đánh giá dịch vụ
```
GET /api/service-ratings?service_id=X
```
Lấy tất cả đánh giá của một dịch vụ.

## Files đã thay đổi

### Frontend
- `service-rating.html`: Thêm phần đánh giá dịch vụ
- `service-rating-demo.html`: Trang demo để test

### Backend
- `server.js`: Thêm API endpoints mới

### Database
- `create_booking_services_table.sql`: Tạo bảng booking_services
- `demo_service_rating.sql`: Dữ liệu demo để test

## Cách test

1. **Setup database:**
   ```bash
   mysql -u root -p quanlykhachsan < create_booking_services_table.sql
   mysql -u root -p quanlykhachsan < demo_service_rating.sql
   ```

2. **Khởi động server:**
   ```bash
   cd backend
   node server.js
   ```

3. **Test:**
   - Truy cập: `http://localhost:3001/service-rating-demo.html`
   - Test case 1: Booking có dịch vụ (sẽ hiển thị form đánh giá dịch vụ)
   - Test case 2: Booking không có dịch vụ (chỉ đánh giá phòng + nhân viên)

## Validation

- Bắt buộc đánh giá tất cả dịch vụ đã sử dụng
- Đánh giá từ 1-5 sao
- Có thể để trống nhận xét dịch vụ

## Lưu ý

- Tính năng tương thích ngược: không ảnh hưởng đến form đánh giá cũ
- Dữ liệu đánh giá dịch vụ lưu riêng, không trộn với đánh giá chung
- API không yêu cầu authentication để khách hàng có thể đánh giá dễ dàng