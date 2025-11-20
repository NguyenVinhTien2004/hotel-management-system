# 🎨 HƯỚNG DẪN SỬ DỤNG ANIMATION - KHÁCH SẠN CÂY DỪA

## 📁 Files đã tạo:
- `animations.css` - CSS animations và effects
- `animations.js` - JavaScript animations và interactions
- `ANIMATION_GUIDE.md` - Hướng dẫn này

## 🚀 Cách sử dụng:

### 1. Thêm vào HTML:
```html
<link rel="stylesheet" href="animations.css">
<script src="animations.js"></script>
```

### 2. CSS Animation Classes:

#### ✨ Basic Animations:
- `.animate-fade-in` - Hiệu ứng fade in
- `.animate-slide-in-left` - Trượt vào từ trái
- `.animate-slide-in-right` - Trượt vào từ phải
- `.animate-slide-in-up` - Trượt lên từ dưới
- `.animate-slide-in-down` - Trượt xuống từ trên
- `.animate-scale-in` - Phóng to từ nhỏ
- `.animate-bounce` - Hiệu ứng nảy
- `.animate-pulse` - Hiệu ứng nhấp nháy
- `.animate-spin` - Xoay tròn
- `.animate-glow` - Hiệu ứng phát sáng

#### ⏱️ Delay Classes:
- `.delay-100` - Trễ 0.1s
- `.delay-200` - Trễ 0.2s
- `.delay-300` - Trễ 0.3s
- `.delay-400` - Trễ 0.4s
- `.delay-500` - Trễ 0.5s
- `.delay-600` - Trễ 0.6s

#### 🎯 Hover Effects:
- `.btn-hover-lift` - Nút nâng lên khi hover
- `.btn-hover-scale` - Nút phóng to khi hover
- `.btn-hover-glow` - Nút phát sáng khi hover
- `.card-hover` - Card nâng lên khi hover
- `.card-hover-scale` - Card phóng to khi hover

#### 🔄 Transitions:
- `.smooth-transition` - Chuyển đổi mượt mà
- `.smooth-transition-fast` - Chuyển đổi nhanh
- `.smooth-transition-slow` - Chuyển đổi chậm

### 3. Ví dụ sử dụng:

#### Trang chính:
```html
<nav class="animate-slide-in-down">
    <div class="animate-fade-in delay-200">Logo</div>
</nav>

<div class="card-hover animate-fade-in delay-100">
    <button class="btn-hover-glow">Đặt phòng</button>
</div>
```

#### Form:
```html
<form class="animate-scale-in">
    <input class="input-focus smooth-transition">
    <button class="btn-hover-lift animate-fade-in delay-300">Submit</button>
</form>
```

#### Grid/List:
```html
<div class="grid">
    <div class="stagger-item card-hover">Item 1</div>
    <div class="stagger-item card-hover">Item 2</div>
    <div class="stagger-item card-hover">Item 3</div>
</div>
```

### 4. JavaScript Functions:

#### 📢 Notifications:
```javascript
AnimationUtils.showNotification('Thành công!', 'success');
AnimationUtils.showNotification('Lỗi!', 'error');
AnimationUtils.showNotification('Cảnh báo!', 'warning');
AnimationUtils.showNotification('Thông tin', 'info');
```

#### 🔢 Counter Animation:
```javascript
AnimationUtils.animateCounter(element, 0, 100, 2000);
```

#### ⌨️ Typing Effect:
```javascript
AnimationUtils.typeWriter(element, 'Khách sạn Cây Dừa', 100);
```

#### 📱 Modal:
```javascript
AnimationUtils.openModal(modalElement);
AnimationUtils.closeModal(modalElement);
```

#### ⏳ Loading:
```javascript
AnimationUtils.showLoading('elementId');
AnimationUtils.hideLoading('elementId', 'New content');
```

### 5. Áp dụng vào trang mới:

#### Bước 1: Thêm CSS và JS
```html
<link rel="stylesheet" href="animations.css">
<script src="animations.js"></script>
```

#### Bước 2: Thêm classes vào elements
```html
<!-- Navigation -->
<nav class="animate-slide-in-down">

<!-- Main content -->
<main class="animate-fade-in delay-200">

<!-- Cards -->
<div class="card-hover animate-fade-in delay-100">

<!-- Buttons -->
<button class="btn-hover-glow smooth-transition">

<!-- Forms -->
<input class="input-focus smooth-transition">
```

#### Bước 3: Sử dụng JavaScript functions
```javascript
// Thay thế alert() bằng notifications
AnimationUtils.showNotification('Message', 'type');

// Thêm loading states
AnimationUtils.showLoading('content');
```

### 6. Tùy chỉnh Animation:

#### Thay đổi thời gian:
```css
.custom-animation {
    animation-duration: 1s; /* Thay đổi thời gian */
    animation-delay: 0.5s;  /* Thay đổi độ trễ */
}
```

#### Tạo animation mới:
```css
@keyframes customEffect {
    from { /* Trạng thái bắt đầu */ }
    to { /* Trạng thái kết thúc */ }
}

.custom-effect {
    animation: customEffect 0.6s ease-out;
}
```

### 7. Best Practices:

#### ✅ Nên làm:
- Sử dụng animation để cải thiện UX
- Giữ animation ngắn gọn (< 1s)
- Sử dụng easing functions phù hợp
- Test trên mobile devices
- Respect prefers-reduced-motion

#### ❌ Không nên:
- Lạm dụng animation
- Animation quá chậm hoặc quá nhanh
- Animation gây chóng mặt
- Bỏ qua accessibility

### 8. Mobile Optimization:

Animation đã được tối ưu cho mobile:
```css
@media (max-width: 768px) {
    .animate-fade-in { animation-duration: 0.4s; }
}
```

### 9. Accessibility:

Hỗ trợ reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; }
}
```

### 10. Ví dụ hoàn chỉnh cho trang mới:

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="animations.css">
    <script src="animations.js"></script>
</head>
<body>
    <nav class="animate-slide-in-down">
        <div class="animate-fade-in delay-200">Navigation</div>
    </nav>
    
    <main class="animate-fade-in delay-300">
        <div class="grid">
            <div class="stagger-item card-hover">
                <button class="btn-hover-glow">Action</button>
            </div>
        </div>
    </main>
    
    <script>
        // Sử dụng notifications thay vì alert
        document.querySelector('button').addEventListener('click', () => {
            AnimationUtils.showNotification('Thành công!', 'success');
        });
    </script>
</body>
</html>
```

## 🎯 Kết quả:
- Giao diện mượt mà, chuyên nghiệp
- Trải nghiệm người dùng tốt hơn
- Tương tác sinh động
- Responsive trên mọi thiết bị
- Accessibility friendly

Chúc bạn thành công! 🚀