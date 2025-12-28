# 🎬 DATABASE SETUP - HỆ THỐNG ĐẶT VÉ XEM PHIM

Hệ thống database cho ứng dụng đặt vé xem phim với tính năng **Concurrency Control** (kiểm soát race condition khi nhiều người cùng đặt 1 ghế).

## 📋 MỤC LỤC

- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc Database](#cấu-trúc-database)
- [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
- [Sử dụng với Spring Boot](#sử-dụng-với-spring-boot)
- [Quản trị Database](#quản-trị-database)
- [Tính năng Concurrency Control](#tính-năng-concurrency-control)
- [Troubleshooting](#troubleshooting)

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

- **Database**: MySQL 8.0
- **Container**: Docker & Docker Compose
- **Admin Tool**: phpMyAdmin
- **Backend Framework**: Java Spring Boot
- **ORM**: Spring Data JPA (Hibernate)

---

## 📊 CẤU TRÚC DATABASE

### Danh sách Tables (7 bảng chính + 2 bảng phụ)

| Bảng | Mô tả | Vai trò |
|------|-------|---------|
| `users` | Quản lý người dùng | Authentication |
| `movies` | Thông tin phim | Catalog |
| `cinemas` | Thông tin rạp chiếu | Location |
| `showtimes` | Lịch chiếu phim | Schedule |
| `seats` | Ghế ngồi trong suất chiếu | Seat Map |
| **`seat_locks`** ⭐ | Lock ghế tạm thời | **Concurrency Control** |
| `bookings` | Đơn đặt vé | Order Management |
| `booking_seats` | Chi tiết ghế đã đặt | Many-to-Many |
| `audit_logs` | Lịch sử thao tác | Audit Trail |

### ERD Diagram (Mối quan hệ chính)

```
users (1) ─────── (N) bookings
                     │
                     │ (N)
                     │
showtimes (1) ─────── (N) seats
    │                   │
    │ (N)                │ (1)
    │                   │
movies (1)          seat_locks (N) ─── (1) users
    │
    │ (N)
    │
cinemas (1)
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT

### Yêu cầu

- Docker Desktop đã cài đặt và đang chạy
- Port `3306` (MySQL) và `8080` (phpMyAdmin) chưa bị sử dụng

### Bước 1: Clone hoặc tải project

```bash
cd movie-tickets/db
```

### Bước 2: Khởi động Database với Docker

```bash
docker-compose up -d
```

Lệnh này sẽ:
- ✅ Tải MySQL 8.0 image
- ✅ Tải phpMyAdmin image
- ✅ Tạo database `movie_tickets_db`
- ✅ Tự động chạy `init.sql` để tạo schema
- ✅ Tự động chạy `seed-data.sql` để insert dữ liệu mẫu

### Bước 3: Kiểm tra containers đang chạy

```bash
docker-compose ps
```

Kết quả mong đợi:

```
NAME                        STATUS
movie-tickets-mysql         Up (healthy)
movie-tickets-phpmyadmin    Up
```

### Bước 4: Kiểm tra logs (nếu có lỗi)

```bash
# Xem logs của MySQL
docker-compose logs mysql

# Xem logs của phpMyAdmin
docker-compose logs phpmyadmin
```

---

## ☕ SỬ DỤNG VỚI SPRING BOOT

### 1. Thêm Dependencies vào `pom.xml`

```xml
<!-- MySQL Driver -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Spring Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- HikariCP (Connection Pool) - Mặc định đã có trong Spring Boot -->
<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
</dependency>
```

### 2. Cấu hình `application.yml` hoặc `application.properties`

#### Option 1: application.yml (Khuyên dùng)

```yaml
spring:
  # Datasource Configuration
  datasource:
    url: jdbc:mysql://localhost:3306/movie_tickets_db?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&characterEncoding=UTF-8
    username: movie_app
    password: movie_pass123
    driver-class-name: com.mysql.cj.jdbc.Driver
    
    # HikariCP Connection Pool
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 20000
      idle-timeout: 300000
      max-lifetime: 1800000
      pool-name: MovieTicketsHikariPool
  
  # JPA Configuration
  jpa:
    database-platform: org.hibernate.dialect.MySQL8Dialect
    hibernate:
      ddl-auto: none # KHÔNG tự động tạo/sửa schema (đã có init.sql)
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        use_sql_comments: true
        jdbc:
          time_zone: Asia/Ho_Chi_Minh
        
# Logging
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

#### Option 2: application.properties

```properties
# Datasource
spring.datasource.url=jdbc:mysql://localhost:3306/movie_tickets_db?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&characterEncoding=UTF-8
spring.datasource.username=movie_app
spring.datasource.password=movie_pass123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# HikariCP
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=20000

# JPA
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.jdbc.time_zone=Asia/Ho_Chi_Minh

# Logging
logging.level.org.hibernate.SQL=DEBUG
```

### 3. Tạo Entity Classes (Ví dụ: User.java)

```java
package com.example.movietickets.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;
    
    @Column(length = 20)
    private String phone;
    
    @Column(length = 20)
    private String role = "USER";
    
    @Column(length = 20)
    private String status = "ACTIVE";
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

### 4. Tạo Repository Interface

```java
package com.example.movietickets.repository;

import com.example.movietickets.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Tìm user theo email
    Optional<User> findByEmail(String email);
    
    // Kiểm tra email đã tồn tại chưa
    boolean existsByEmail(String email);
}
```

### 5. Test Connection

```java
package com.example.movietickets;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import javax.sql.DataSource;
import java.sql.Connection;

@SpringBootApplication
public class MovieTicketsApplication {

    public static void main(String[] args) {
        SpringApplication.run(MovieTicketsApplication.class, args);
    }
    
    // Test database connection khi khởi động
    @Bean
    public CommandLineRunner testConnection(DataSource dataSource) {
        return args -> {
            try (Connection conn = dataSource.getConnection()) {
                System.out.println("✅ Database connection successful!");
                System.out.println("Database: " + conn.getCatalog());
                System.out.println("URL: " + conn.getMetaData().getURL());
            } catch (Exception e) {
                System.err.println("❌ Database connection failed!");
                e.printStackTrace();
            }
        };
    }
}
```

---

## 🔧 QUẢN TRỊ DATABASE

### Sử dụng phpMyAdmin (Giao diện Web)

1. Mở trình duyệt và truy cập: **http://localhost:8080**

2. Đăng nhập với thông tin:
   - **Server**: `mysql`
   - **Username**: `movie_app`
   - **Password**: `movie_pass123`
   
   Hoặc dùng root:
   - **Username**: `root`
   - **Password**: `root123`

3. Chọn database `movie_tickets_db` để xem các bảng

### Sử dụng MySQL CLI

```bash
# Kết nối vào container MySQL
docker exec -it movie-tickets-mysql mysql -u movie_app -p

# Nhập password: movie_pass123

# Chọn database
USE movie_tickets_db;

# Liệt kê các bảng
SHOW TABLES;

# Xem cấu trúc bảng
DESCRIBE users;

# Query dữ liệu
SELECT * FROM users;
SELECT * FROM showtimes;
SELECT * FROM seats WHERE showtime_id = 1 LIMIT 10;
```

### Sử dụng MySQL Workbench (Desktop App)

1. Mở MySQL Workbench
2. Tạo connection mới:
   - **Hostname**: `localhost`
   - **Port**: `3306`
   - **Username**: `movie_app`
   - **Password**: `movie_pass123`
3. Test connection và Connect

---

## ⚡ TÍNH NĂNG CONCURRENCY CONTROL

### Vấn đề: Race Condition

Khi 2 người dùng (User A và User B) cùng chọn ghế A1 tại cùng 1 thời điểm:

```
User A: Chọn ghế A1 (Lock)  ──┐
                               ├─ RACE CONDITION ❌
User B: Chọn ghế A1 (Lock)  ──┘
```

### Giải pháp: Bảng `seat_locks` với UNIQUE Constraint

```sql
UNIQUE KEY uk_seat_holding (seat_id, status)
```

**Cơ chế hoạt động:**

1. **User A chọn ghế A1:**
   - INSERT INTO seat_locks (seat_id=123, user_id=1, status='HOLDING', expires_at=NOW()+90s)
   - ✅ SUCCESS
   - Ghế A1 bị LOCK trong 90 giây

2. **User B cũng chọn ghế A1 (cùng lúc):**
   - INSERT INTO seat_locks (seat_id=123, user_id=2, status='HOLDING', expires_at=NOW()+90s)
   - ❌ FAIL: Duplicate key error (uk_seat_holding)
   - Database tự động reject

3. **User A thanh toán trong 90 giây:**
   - UPDATE seat_locks SET status='CONFIRMED' WHERE id=1
   - UPDATE seats SET status='BOOKED' WHERE id=123
   - INSERT INTO bookings (...)
   - ✅ Ghế A1 đã thuộc về User A

4. **Nếu User A không thanh toán:**
   - Background job chạy mỗi 30 giây: CALL sp_cleanup_expired_locks()
   - Tự động giải phóng lock đã hết hạn
   - Ghế A1 quay về trạng thái AVAILABLE

### API Flow trong Spring Boot

```java
// Service để lock ghế
@Transactional
public SeatLockResponse lockSeat(Long seatId, Long userId) {
    try {
        // Kiểm tra ghế còn trống không
        Seat seat = seatRepository.findById(seatId)
            .orElseThrow(() -> new NotFoundException("Ghế không tồn tại"));
        
        if (!seat.getStatus().equals("AVAILABLE")) {
            throw new BusinessException("Ghế đã được đặt hoặc đang bị giữ");
        }
        
        // Tạo lock (Database sẽ kiểm tra UNIQUE constraint)
        SeatLock lock = new SeatLock();
        lock.setSeatId(seatId);
        lock.setUserId(userId);
        lock.setLockedAt(LocalDateTime.now());
        lock.setExpiresAt(LocalDateTime.now().plusSeconds(90));
        lock.setStatus("HOLDING");
        
        seatLockRepository.save(lock); // ← Có thể throw DuplicateKeyException
        
        // Cập nhật trạng thái ghế
        seat.setStatus("LOCKED");
        seatRepository.save(seat);
        
        return new SeatLockResponse(true, "Lock ghế thành công", lock);
        
    } catch (DataIntegrityViolationException e) {
        // Duplicate key → Ghế đã bị lock bởi user khác
        throw new BusinessException("Ghế đang được giữ bởi người khác. Vui lòng chọn ghế khác.");
    }
}
```

### Background Job: Cleanup Expired Locks

```java
@Component
public class SeatLockCleanupScheduler {
    
    @Autowired
    private EntityManager entityManager;
    
    // Chạy mỗi 30 giây
    @Scheduled(fixedDelay = 30000)
    @Transactional
    public void cleanupExpiredLocks() {
        // Gọi stored procedure
        entityManager
            .createStoredProcedureQuery("sp_cleanup_expired_locks")
            .execute();
        
        log.info("Expired seat locks cleaned up");
    }
}
```

---

## 📝 VIEWS VÀ STORED PROCEDURES

### View: Thống kê trạng thái ghế

```sql
SELECT * FROM v_showtime_seat_stats WHERE showtime_id = 1;
```

Kết quả:
```
showtime_id | movie_title | cinema_name | seats_available | seats_locked | seats_booked | occupancy_rate
1           | Avatar      | CGV Vincom  | 117             | 0            | 3            | 2.50%
```

### View: Lịch sử booking của user

```sql
SELECT * FROM v_user_bookings WHERE user_id = 1;
```

### Stored Procedure: Cleanup expired locks

```sql
-- Gọi thủ công (hoặc dùng Spring @Scheduled)
CALL sp_cleanup_expired_locks();
```

---

## 🛑 DỪNG VÀ XÓA DATABASE

### Dừng containers (dữ liệu vẫn còn)

```bash
docker-compose stop
```

### Khởi động lại

```bash
docker-compose start
```

### Xóa containers (dữ liệu vẫn còn trong volume)

```bash
docker-compose down
```

### Xóa hoàn toàn (bao gồm cả dữ liệu)

```bash
docker-compose down -v
```

---

## 🐛 TROUBLESHOOTING

### Lỗi: Port 3306 đã được sử dụng

**Nguyên nhân:** Có MySQL khác đang chạy trên máy

**Giải pháp:**
```bash
# Tắt MySQL service đang chạy (Windows)
net stop MySQL80

# Hoặc đổi port trong docker-compose.yml
ports:
  - "3307:3306"  # Thay vì 3306:3306
```

### Lỗi: Port 8080 đã được sử dụng

**Giải pháp:** Đổi port phpMyAdmin trong docker-compose.yml
```yaml
phpmyadmin:
  ports:
    - "8081:80"  # Thay vì 8080:80
```

### Lỗi: Database connection timeout

**Kiểm tra:**
```bash
# Xem logs MySQL
docker-compose logs mysql

# Restart containers
docker-compose restart
```

### Reset toàn bộ database

```bash
# Xóa containers và volumes
docker-compose down -v

# Khởi động lại (sẽ tạo database mới)
docker-compose up -d
```

### Import dữ liệu mới

```bash
# Copy file .sql vào container
docker cp custom-data.sql movie-tickets-mysql:/tmp/

# Chạy file SQL
docker exec -i movie-tickets-mysql mysql -u movie_app -pmovie_pass123 movie_tickets_db < /tmp/custom-data.sql
```

---

## 📚 TÀI LIỆU THAM KHẢO

- [MySQL 8.0 Documentation](https://dev.mysql.com/doc/refman/8.0/en/)
- [Spring Data JPA Reference](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [phpMyAdmin Documentation](https://www.phpmyadmin.net/docs/)

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs: `docker-compose logs`
2. Kiểm tra containers: `docker-compose ps`
3. Xem file [BACKEND-DATABASE-SPEC.md](../fe/BACKEND-DATABASE-SPEC.md) để hiểu rõ requirements

---

## ✅ CHECKLIST SAU KHI CÀI ĐẶT

- [ ] Docker containers đang chạy (`docker-compose ps`)
- [ ] Truy cập phpMyAdmin thành công (http://localhost:8080)
- [ ] Database `movie_tickets_db` đã được tạo
- [ ] Có 9 tables trong database
- [ ] Có dữ liệu mẫu (3 users, 4 movies, 4 cinemas, 13 showtimes)
- [ ] Spring Boot kết nối database thành công
- [ ] Test query SELECT * FROM users; chạy được

---

**🎉 Chúc bạn code vui vẻ!** 🚀
