# HƯỚNG DẪN KHẮC PHỤC SỰ CỐ

## 🔍 VẤN ĐỀ: Menu chức năng không hiển thị dữ liệu

### ✅ NGUYÊN NHÂN ĐÃ XÁC ĐỊNH:
1. **Server đang chạy bình thường** - API trả về dữ liệu đúng
2. **Database có đủ dữ liệu** - 20 phòng, 4 dịch vụ
3. **Vấn đề ở frontend** - Không hiển thị dữ liệu từ API

### 🛠️ CÁC BƯỚC KHẮC PHỤC ĐÃ THỰC HIỆN:

#### 1. Sửa lỗi hiển thị dữ liệu
- ✅ Thêm debug logging vào tất cả API calls
- ✅ Thêm error handling và hiển thị lỗi cho user
- ✅ Sửa lỗi authentication cho các API không cần token
- ✅ Thêm loading states và retry buttons

#### 2. Cải thiện cấu hình
- ✅ Sử dụng AppConfig.getApiUrl() thống nhất
- ✅ Thêm cache busting để tránh cache cũ
- ✅ Cải thiện error messages

#### 3. Tạo công cụ debug
- ✅ Tạo debug.html để test tất cả API
- ✅ Tạo restart-server.bat để khởi động lại dễ dàng
- ✅ Thêm logging chi tiết

### 🚀 CÁCH SỬ DỤNG:

#### Bước 1: Khởi động server
```bash
# Cách 1: Sử dụng script tự động
double-click restart-server.bat

# Cách 2: Thủ công
cd backend
node server.js
```

#### Bước 2: Kiểm tra hệ thống
1. Mở http://localhost:3001/debug.html
2. Click "Test Rooms API" - phải thấy 20 phòng
3. Click "Test Services API" - phải thấy 4 dịch vụ
4. Click "Test Login" để đăng nhập admin
5. Click "Test Bookings API" để kiểm tra đặt phòng

#### Bước 3: Sử dụng hệ thống
1. Đăng nhập: http://localhost:3001/index.html
   - Admin: `admin` / `@@@@`
   - Hoặc tự đăng ký tài khoản khách hàng

2. Dashboard: http://localhost:3001/dashboard.html
3. Xem phòng: http://localhost:3001/room-list.html
4. Đặt phòng: http://localhost:3001/bookings.html

### 🔧 NẾU VẪN CÓ VẤN ĐỀ:

#### Vấn đề 1: Không thấy dữ liệu phòng
```javascript
// Mở Developer Tools (F12) và kiểm tra Console
// Phải thấy:
// 🔄 Loading rooms with status=available...
// 📡 Response status: 200
// ✅ Loaded rooms: 20
```

#### Vấn đề 2: Lỗi kết nối API
```bash
# Kiểm tra server có chạy không
netstat -an | findstr :3001

# Khởi động lại server
cd backend
node server.js
```

#### Vấn đề 3: Cache cũ
```javascript
// Trong browser, nhấn F12 > Application > Storage
// Clear All Storage
// Hoặc Ctrl+Shift+R để hard refresh
```

### 📋 CHECKLIST KHẮC PHỤC:

- [ ] Server chạy trên port 3001
- [ ] MySQL database "quanlykhachsan" tồn tại
- [ ] API trả về dữ liệu đúng (test qua debug.html)
- [ ] Browser không cache cũ (hard refresh)
- [ ] Console không có lỗi JavaScript
- [ ] Token authentication hoạt động

### 🆘 LIÊN HỆ HỖ TRỢ:

Nếu vẫn gặp vấn đề, cung cấp thông tin:
1. Screenshot của debug.html results
2. Console errors (F12 > Console)
3. Network tab trong Developer Tools
4. Server logs từ terminal

### 📝 GHI CHÚ QUAN TRỌNG:

1. **Rooms API không cần authentication** - có thể test trực tiếp
2. **Bookings API cần token** - phải đăng nhập trước
3. **Admin account**: admin/@@@@
4. **Database có 20 phòng mẫu** - nếu không thấy thì database có vấn đề
5. **Port 3001** - đảm bảo không bị conflict

---
*Cập nhật lần cuối: $(Get-Date)*