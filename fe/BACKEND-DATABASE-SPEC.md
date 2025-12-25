# 🎯 BACKEND & DATABASE SPECIFICATION - FINAL

**Ngày:** 25/12/2025  
**Phạm vi:** Demo Concurrency Control - 2 users đặt cùng 1 ghế  
**Nguồn:** Quét toàn bộ source code project

---

## 1️⃣ DANH SÁCH API BACKEND CẦN THIẾT (FINAL)

| Method | Endpoint | Mục đích |
|--------|----------|----------|
| POST | `/auth/login` | Đăng nhập user (seed account) |
| GET | `/movies/{id}` | Lấy thông tin phim |
| GET | `/cinemas/{id}` | Lấy thông tin rạp |
| GET | `/showtimes/{id}` | Lấy thông tin suất chiếu |
| GET | `/showtimes/{id}/seats` | Lấy danh sách ghế + trạng thái real-time |
| POST | `/seats/lock` | Lock ghế tạm thời (90 giây) |
| POST | `/seats/release` | Thả ghế đã lock |
| POST | `/bookings` | Tạo đơn booking |
| POST | `/bookings/{id}/confirm` | Xác nhận thanh toán (commit ghế) |
| GET | `/bookings/{id}` | Lấy chi tiết đơn vé |
| GET | `/bookings/user/{userId}` | Lấy danh sách vé của user (kho vé) |

**Tổng:** 11 APIs

---

## 2️⃣ DANH SÁCH DATABASE TABLE CẦN THIẾT (FINAL)

```
users
movies
cinemas
showtimes
seats
seat_locks
bookings
```

**Tổng:** 7 tables

---

## 3️⃣ CỘT CHÍNH CỦA MỖI BẢNG (FINAL)

### Table: `users`
```
- id
- email
- name
- password_hash
```

### Table: `movies`
```
- id
- title
- poster_url
- duration
- genre
- release_date
- rating
- description
```

### Table: `cinemas`
```
- id
- name
- address
```

### Table: `showtimes`
```
- id
- movie_id
- cinema_id
- start_time
- end_time
- date
- price
- room_number
```

### Table: `seats`
```
- id
- showtime_id
- row
- number
- price
```

### Table: `seat_locks` ⭐ **CORE TABLE**
```
- id
- seat_id
- user_id
- locked_at
- expires_at
- status
```

### Table: `bookings`
```
- id
- user_id
- showtime_id
- seat_ids
- total_amount
- status
- created_at
- confirmed_at
- hold_until
```

---

## 4️⃣ XÁC NHẬN PHẠM VI CUỐI

### ✅ Đảm bảo:
- ✅ API trên đủ cho demo concurrency
- ✅ DB trên tối thiểu – không dư
- ✅ Có thể demo 2 user đặt cùng 1 ghế
- ✅ Lock ghế 90 giây + auto-expire
- ✅ Race condition được kiểm soát

### ❌ Không có:
- ❌ Chức năng production
- ❌ Admin dashboard
- ❌ Payment gateway
- ❌ Email/SMS notification
- ❌ Voucher/Discount
- ❌ Report/Analytics

---

## 🎬 FLOW DEMO

```
User A + User B
  ↓
POST /auth/login (user1@demo.com, user2@demo.com)
  ↓
GET /showtimes/{id}/seats
  ↓
User A: POST /seats/lock {seat_id: A1} → ✅ SUCCESS
User B: POST /seats/lock {seat_id: A1} → ❌ FAIL (ghế đang được giữ)
  ↓
User A: POST /bookings/{id}/confirm → ✅ SUCCESS
  ↓
GET /showtimes/{id}/seats → Ghế A1 = ĐÃ_ĐẶT
```

---

## 📊 CONCURRENCY CONTROL

**Cơ chế:**
- `seat_locks` table với UNIQUE constraint trên `(seat_id, status)` WHERE `status='HOLDING'`
- Database tự động reject duplicate lock
- TTL: 90 giây (expires_at)
- Background job xóa expired locks

**Race condition được giải quyết tại:**
- Database layer (atomic INSERT)
- Không phụ thuộc application logic

---

**✅ Specification hoàn tất. Backend & Database đã được chốt cho demo concurrency control.**
