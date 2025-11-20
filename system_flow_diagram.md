# SƠ ĐỒ LUỒNG HỆ THỐNG - QUẢN LÝ KHÁCH SẠN

## 1. KIẾN TRÚC TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (HTML/JS)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  CUSTOMER UI    │  │   ADMIN UI      │  │  LOGIN UI    │ │
│  │                 │  │                 │  │              │ │
│  │ • Dashboard     │  │ • Admin Panel   │  │ • Customer   │ │
│  │ • Booking       │  │ • Manage Rooms  │  │ • Admin      │ │
│  │ • Room List     │  │ • Invoices      │  │              │ │
│  │ • Profile       │  │ • Services      │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/REST API
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js/Express)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ AUTHENTICATION  │  │   MIDDLEWARE    │  │   ROUTES     │ │
│  │                 │  │                 │  │              │ │
│  │ • JWT Tokens    │  │ • Auth Check    │  │ • /api/auth  │ │
│  │ • Role Check    │  │ • Role Check    │  │ • /api/rooms │ │
│  │ • Password Hash │  │ • Error Handle  │  │ • /api/book  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                │ SQL Queries
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE (MySQL)                        │
├─────────────────────────────────────────────────────────────┤
│  users │ rooms │ bookings │ services │ invoices │ feedback   │
└─────────────────────────────────────────────────────────────┘
```

## 2. LUỒNG HOẠT ĐỘNG CHÍNH

### A. LUỒNG KHÁCH HÀNG
```
[Khách hàng] → [Đăng ký/Đăng nhập] → [Xem phòng] → [Đặt phòng] → [Thanh toán] → [Đánh giá]
     │              │                      │             │             │             │
     ▼              ▼                      ▼             ▼             ▼             ▼
  register      login.html           room-list.html  bookings.html  invoices    feedback
     │              │                      │             │             │             │
     ▼              ▼                      ▼             ▼             ▼             ▼
 users table    JWT token            rooms table    bookings      invoices     feedback
                                                      table         table        table
```

### B. LUỒNG ADMIN
```
[Admin] → [Đăng nhập Admin] → [Quản lý] → [Tạo hóa đơn] → [Xem báo cáo]
   │            │                │             │              │
   ▼            ▼                ▼             ▼              ▼
admin-login  JWT + role      admin-panel   invoices      dashboard
   │            │                │             │              │
   ▼            ▼                ▼             ▼              ▼
users table  middleware    CRUD operations  invoice_      statistics
(role=admin)  check        on all tables   services
```

## 3. PHÂN QUYỀN HỆ THỐNG

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    CUSTOMER     │    │      STAFF      │    │     ADMIN       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Xem phòng     │    │ • Tất cả quyền  │    │ • Tất cả quyền  │
│ • Đặt phòng     │    │   của Customer  │    │   của Staff     │
│ • Xem booking   │    │ • Quản lý đặt   │    │ • Xóa tài khoản │
│   của mình      │    │   phòng         │    │ • Xem logs      │
│ • Đánh giá      │    │ • Tạo hóa đơn   │    │ • Quản lý user  │
│ • Cập nhật      │    │ • Quản lý phòng │    │ • Cấu hình hệ   │
│   profile       │    │ • Quản lý dịch  │    │   thống         │
└─────────────────┘    │   vụ            │    └─────────────────┘
                       └─────────────────┘
```

## 4. LUỒNG DỮ LIỆU

```
1. ĐĂNG KÝ/ĐĂNG NHẬP
   Frontend → POST /api/auth/login → Backend → Check users table → Return JWT

2. ĐẶT PHÒNG
   Frontend → POST /api/bookings → Backend → Insert bookings table → Update rooms status

3. TẠO HÓA ĐƠN
   Admin → POST /api/admin/invoices → Backend → Insert invoices + invoice_services

4. ĐÁNH GIÁ
   Customer → POST /api/feedback → Backend → Insert feedback table

5. QUẢN LÝ PHÒNG
   Admin → PUT/DELETE /api/rooms → Backend → Update/Delete rooms table → Log admin_logs
```

## 5. BẢO MẬT

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │    DATABASE     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • JWT Storage   │    │ • JWT Verify    │    │ • Password Hash │
│ • Role Check    │    │ • Role Middleware│   │ • Foreign Keys  │
│ • Route Guard   │    │ • Input Valid   │    │ • Constraints   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```