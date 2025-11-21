# SỬA LỖI DROPDOWN TRỐNG TRÊN MOBILE

## Vấn đề
Trên điện thoại, dropdown "Chọn phòng" trong trang đặt phòng hiển thị trống, không load được danh sách phòng.

## Nguyên nhân
- API URL hardcode `localhost:3001` không hoạt động trên mobile
- Cần sử dụng IP thực của máy tính thay vì localhost

## Đã sửa
✅ Cập nhật file `js/config.js` để tự động phát hiện IP
✅ Sửa các file HTML sử dụng `AppConfig.getApiUrl()` thay vì hardcode
✅ Thêm import `config.js` vào các file cần thiết

## Cách kiểm tra
1. **Restart server backend:**
   ```
   cd backend
   Ctrl+C (để dừng server)
   node server.js
   ```

2. **Xóa cache trình duyệt mobile:**
   - Nhấn F12 (hoặc menu Developer Tools)
   - Chuột phải vào nút Refresh → "Empty Cache and Hard Reload"
   - Hoặc nhấn Ctrl + Shift + R

3. **Truy cập lại từ mobile:**
   - URL: `http://[IP_MÁY_TÍNH]:3001/index.html`
   - Ví dụ: `http://192.168.1.178:3001/index.html`

## Kiểm tra IP máy tính
```cmd
ipconfig
```
Tìm dòng "IPv4 Address" trong phần "Wireless LAN adapter Wi-Fi"

## Nếu vẫn lỗi
1. Kiểm tra firewall Windows có chặn port 3001 không
2. Đảm bảo điện thoại và máy tính cùng mạng WiFi
3. Thử truy cập `http://[IP]:3001/api/rooms` trực tiếp để test API

## Files đã sửa
- `js/config.js` - Tự động phát hiện IP
- `bookings.html` - Sử dụng config API URL + CSS responsive cho mobile
- `admin-services.html` - Sử dụng config API URL  
- `rooms.html` - Sử dụng config API URL
- `customers.html` - Sử dụng config API URL
- `admin-dashboard.js` - Sử dụng config API URL
- `booking-history.html` - Sử dụng config API URL

## Cải tiến giao diện mobile
✅ Ô ngày nhận/trả phòng gọn gàng hơn
✅ Layout responsive trên màn hình nhỏ
✅ Không bị đè lên nhau
✅ Font size và padding phù hợp mobile

Bây giờ ứng dụng sẽ tự động sử dụng IP đúng và hiển thị đẹp trên mobile! 📱