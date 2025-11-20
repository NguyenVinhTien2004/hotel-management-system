# Cấu hình API URL

## Cách sử dụng

Tất cả các file HTML đã được cập nhật để sử dụng file `config.js` chung.

### Thay đổi cổng server:

1. Mở file `js/config.js`
2. Sửa dòng:
```javascript
API_BASE_URL: 'http://localhost:3001',
API_URL: 'http://localhost:3001/api',
```

3. Thay `3001` thành cổng mới (ví dụ: `3002`)

### Lợi ích:

- ✅ Chỉ cần sửa 1 file duy nhất
- ✅ Tất cả trang web tự động cập nhật
- ✅ Không còn xung đột cổng
- ✅ Dễ dàng deploy production

### Ví dụ sử dụng trong code:

```javascript
// Thay vì:
const API_URL = 'http://localhost:3001/api';

// Sử dụng:
const API_URL = AppConfig.getApiUrl();

// Cho hình ảnh:
const imageUrl = AppConfig.getImageUrl('/images/room.jpg');
```