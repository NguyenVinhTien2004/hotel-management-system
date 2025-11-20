# SCHEMA DATABASE - HỆ THỐNG QUẢN LÝ KHÁCH SẠN

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USERS       │    │     ROOMS       │    │   CUSTOMERS     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ username        │    │ number          │    │ name            │
│ name            │    │ name            │    │ phone           │
│ email           │    │ type            │    │ email           │
│ password        │    │ price           │    │ address         │
│ role            │    │ capacity        │    │ id_number       │
│ created_at      │    │ image           │    │ created_at      │
└─────────────────┘    │ status          │    └─────────────────┘
                       │ created_at      │
                       └─────────────────┘
                                │
                                │ room_id (FK)
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    SERVICES     │    │    BOOKINGS     │    │    FEEDBACK     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ name            │    │ customer_name   │    │ booking_id (FK) │
│ price           │    │ customer_phone  │    │ customer_name   │
│ category        │    │ customer_email  │    │ room_number     │
│ description     │    │ room_id (FK)    │    │ room_name       │
│ created_at      │    │ room_number     │    │ room_rating     │
└─────────────────┘    │ room_name       │    │ service_rating  │
         │              │ room_type       │    │ comment         │
         │              │ check_in        │    │ check_in        │
         │              │ check_out       │    │ check_out       │
         │              │ guest_count     │    │ created_at      │
         │              │ total_amount    │    └─────────────────┘
         │              │ payment_method  │             ▲
         │              │ status          │             │
         │              │ created_at      │             │ booking_id (FK)
         │              └─────────────────┘             │
         │                       │                     │
         │                       │ booking_id (FK)     │
         │                       ▼                     │
         │              ┌─────────────────┐             │
         │              │    INVOICES     │─────────────┘
         │              ├─────────────────┤
         │              │ id (PK)         │
         │              │ booking_id (FK) │
         │              │ customer_name   │
         │              │ room_charges    │
         │              │ service_charges │
         │              │ total_amount    │
         │              │ status          │
         │              │ created_at      │
         │              └─────────────────┘
         │                       │
         │                       │ invoice_id (FK)
         │                       ▼
         └──────────────┐ ┌─────────────────┐
                        │ │ INVOICE_SERVICES│
                        │ ├─────────────────┤
                        │ │ id (PK)         │
                        │ │ invoice_id (FK) │
                        └─│ service_id (FK) │
                          │ service_name    │
                          │ quantity        │
                          │ price           │
                          │ total           │
                          └─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│   ADMIN_LOGS    │    │ NOTIFICATIONS   │
├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │
│ admin_id (FK)   │    │ type            │
│ admin_name      │    │ title           │
│ action          │    │ message         │
│ target_type     │    │ booking_id      │
│ target_id       │    │ feedback_id     │
│ reason          │    │ service_id      │
│ details         │    │ for_customers   │
│ created_at      │    │ read_status     │
└─────────────────┘    │ created_at      │
                       └─────────────────┘

LEGEND:
PK = Primary Key
FK = Foreign Key
```

## MỐI QUAN HỆ CHÍNH:
- **ROOMS** ←→ **BOOKINGS**: 1-n (1 phòng có nhiều lượt đặt)
- **BOOKINGS** ←→ **INVOICES**: 1-1 (1 đặt phòng có 1 hóa đơn)
- **BOOKINGS** ←→ **FEEDBACK**: 1-1 (1 đặt phòng có 1 đánh giá)
- **INVOICES** ←→ **INVOICE_SERVICES**: 1-n (1 hóa đơn có nhiều dịch vụ)
- **SERVICES** ←→ **INVOICE_SERVICES**: 1-n (1 dịch vụ dùng trong nhiều hóa đơn)