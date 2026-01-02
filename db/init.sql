-- ============================================================================
-- DATABASE SCHEMA CHO HỆ THỐNG ĐẶT VÉ XEM PHIM
-- ============================================================================
-- Mục đích: Demo Concurrency Control - 2 users đặt cùng 1 ghế
-- Ngày tạo: 28/12/2025
-- Database: MySQL 8.0
-- Framework: Java Spring Boot
-- ============================================================================

-- Thiết lập charset UTF-8 để hỗ trợ tiếng Việt
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================================
-- BẢNG 1: USERS - Quản lý người dùng
-- ============================================================================
-- Mô tả: Lưu trữ thông tin tài khoản người dùng
-- Vai trò: Authentication và phân quyền người dùng

CREATE TABLE IF NOT EXISTS users (
    -- ID tự tăng, khóa chính
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Email đăng nhập (unique để tránh trùng lặp)
    email VARCHAR(100) NOT NULL UNIQUE COMMENT 'Email đăng nhập, phải unique',
    
    -- Tên hiển thị của người dùng
    name VARCHAR(100) NOT NULL COMMENT 'Họ tên người dùng',
    
    -- Mật khẩu đã được hash (BCrypt từ Spring Security)
    password_hash VARCHAR(255) NOT NULL COMMENT 'Mật khẩu đã mã hóa bằng BCrypt',
    
    -- Số điện thoại (optional)
    phone VARCHAR(20) COMMENT 'Số điện thoại liên hệ',
    
    -- Vai trò: USER, ADMIN
    role VARCHAR(20) DEFAULT 'USER' COMMENT 'Vai trò: USER hoặc ADMIN',
    
    -- Trạng thái tài khoản: ACTIVE, INACTIVE, BANNED
    status VARCHAR(20) DEFAULT 'ACTIVE' COMMENT 'Trạng thái tài khoản',
    
    -- Thời gian tạo tài khoản
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo tài khoản',
    
    -- Thời gian cập nhật cuối cùng
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời điểm cập nhật cuối',
    
    -- Index cho email để tăng tốc độ tìm kiếm khi đăng nhập
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Bảng quản lý người dùng - Authentication';


-- ============================================================================
-- BẢNG 2: MOVIES - Quản lý phim
-- ============================================================================
-- Mô tả: Lưu trữ thông tin chi tiết về phim
-- Vai trò: Hiển thị danh sách phim cho người dùng

CREATE TABLE IF NOT EXISTS movies (
    -- ID tự tăng, khóa chính
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Tiêu đề phim
    title VARCHAR(200) NOT NULL COMMENT 'Tên phim',
    
    -- URL poster/thumbnail của phim
    poster_url VARCHAR(500) COMMENT 'Đường dẫn ảnh poster phim',
    
    -- Thời lượng phim (đơn vị: phút)
    duration INT NOT NULL COMMENT 'Thời lượng phim (phút)',
    
    -- Thể loại phim: Action, Drama, Comedy, Horror, etc.
    genre VARCHAR(100) COMMENT 'Thể loại phim',
    
    -- Ngày phát hành
    release_date DATE COMMENT 'Ngày phát hành phim',
    
    -- Đánh giá độ tuổi: P, K, 13+, 16+, 18+
    rating VARCHAR(10) COMMENT 'Đánh giá độ tuổi (P, K, 13+, 16+, 18+)',
    
    -- Mô tả nội dung phim
    description TEXT COMMENT 'Mô tả nội dung phim',
    
    -- Đạo diễn
    director VARCHAR(100) COMMENT 'Đạo diễn phim',
    
    -- Diễn viên chính (phân cách bởi dấu phẩy)
    cast TEXT COMMENT 'Diễn viên chính (cách nhau bởi dấu phẩy)',
    
    -- Ngôn ngữ: Vietnamese, English, etc.
    language VARCHAR(50) DEFAULT 'Vietnamese' COMMENT 'Ngôn ngữ phim',
    
    -- Trạng thái: NOW_SHOWING, COMING_SOON, ENDED
    status VARCHAR(20) DEFAULT 'NOW_SHOWING' COMMENT 'Trạng thái phim',
    
    -- Thời gian tạo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Thời gian cập nhật
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Index cho các trường thường được query
    INDEX idx_status (status),
    INDEX idx_release_date (release_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng quản lý thông tin phim';


-- ============================================================================
-- BẢNG 3: CINEMAS - Quản lý rạp chiếu phim
-- ============================================================================
-- Mô tả: Lưu trữ thông tin về rạp chiếu
-- Vai trò: Hiển thị địa điểm chiếu phim

CREATE TABLE IF NOT EXISTS cinemas (
    -- ID tự tăng, khóa chính
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Tên rạp chiếu
    name VARCHAR(200) NOT NULL COMMENT 'Tên rạp chiếu phim',
    
    -- Địa chỉ rạp
    address TEXT NOT NULL COMMENT 'Địa chỉ đầy đủ của rạp',
    
    -- Tỉnh/Thành phố
    city VARCHAR(100) COMMENT 'Tỉnh/Thành phố',
    
    -- Số điện thoại rạp
    phone VARCHAR(20) COMMENT 'Số điện thoại rạp',
    
    -- Tọa độ GPS (latitude)
    latitude DECIMAL(10, 8) COMMENT 'Vĩ độ GPS',
    
    -- Tọa độ GPS (longitude)
    longitude DECIMAL(11, 8) COMMENT 'Kinh độ GPS',
    
    -- Trạng thái: ACTIVE, MAINTENANCE, CLOSED
    status VARCHAR(20) DEFAULT 'ACTIVE' COMMENT 'Trạng thái rạp',
    
    -- Thời gian tạo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Thời gian cập nhật
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_city (city),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng quản lý rạp chiếu phim';


-- ============================================================================
-- BẢNG 4: SHOWTIMES - Quản lý suất chiếu
-- ============================================================================
-- Mô tả: Lưu trữ lịch chiếu phim tại các rạp
-- Vai trò: Hiển thị lịch chiếu để người dùng chọn suất

CREATE TABLE IF NOT EXISTS showtimes (
    -- ID tự tăng, khóa chính
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Khóa ngoại tham chiếu đến bảng movies
    movie_id BIGINT NOT NULL COMMENT 'ID phim (FK đến bảng movies)',
    
    -- Khóa ngoại tham chiếu đến bảng cinemas
    cinema_id BIGINT NOT NULL COMMENT 'ID rạp (FK đến bảng cinemas)',
    
    -- Ngày chiếu
    showtime_date DATE NOT NULL COMMENT 'Ngày chiếu phim',
    
    -- Thời gian bắt đầu chiếu
    start_time TIME NOT NULL COMMENT 'Giờ bắt đầu chiếu',
    
    -- Thời gian kết thúc chiếu (tính tự động = start_time + duration)
    end_time TIME NOT NULL COMMENT 'Giờ kết thúc chiếu',
    
    -- Số phòng chiếu
    room_number VARCHAR(10) NOT NULL COMMENT 'Số phòng chiếu (VD: P1, P2)',
    
    -- Giá vé cơ bản cho suất chiếu này (VNĐ)
    base_price DECIMAL(10, 2) NOT NULL COMMENT 'Giá vé cơ bản (VNĐ)',
    
    -- Số ghế còn trống (cập nhật khi có booking)
    available_seats INT DEFAULT 0 COMMENT 'Số ghế còn trống',
    
    -- Tổng số ghế
    total_seats INT DEFAULT 0 COMMENT 'Tổng số ghế của phòng',
    
    -- Trạng thái suất chiếu: SCHEDULED, SHOWING, FINISHED, CANCELLED
    status VARCHAR(20) DEFAULT 'SCHEDULED' COMMENT 'Trạng thái suất chiếu',
    
    -- Thời gian tạo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Thời gian cập nhật
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_showtime_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    CONSTRAINT fk_showtime_cinema FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE CASCADE,
    
    -- Indexes để tăng tốc độ query
    INDEX idx_movie_id (movie_id),
    INDEX idx_cinema_id (cinema_id),
    INDEX idx_showtime_date (showtime_date),
    INDEX idx_status (status),
    -- Composite index cho query phổ biến: tìm suất chiếu theo phim và ngày
    INDEX idx_movie_date (movie_id, showtime_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng quản lý suất chiếu phim';


-- ============================================================================
-- BẢNG 5: SEATS - Quản lý ghế ngồi
-- ============================================================================
-- Mô tả: Lưu trữ thông tin về ghế trong từng suất chiếu
-- Vai trò: Hiển thị sơ đồ ghế và trạng thái ghế

CREATE TABLE IF NOT EXISTS seats (
    -- ID tự tăng, khóa chính
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Khóa ngoại tham chiếu đến bảng showtimes
    showtime_id BIGINT NOT NULL COMMENT 'ID suất chiếu (FK đến bảng showtimes)',
    
    -- Hàng ghế (A, B, C, D, ...)
    seat_row VARCHAR(5) NOT NULL COMMENT 'Hàng ghế (A, B, C, ...)',
    
    -- Số ghế trong hàng (1, 2, 3, ...)
    seat_number INT NOT NULL COMMENT 'Số ghế trong hàng (1, 2, 3, ...)',
    
    -- Loại ghế: NORMAL, VIP, COUPLE
    seat_type VARCHAR(20) DEFAULT 'NORMAL' COMMENT 'Loại ghế (NORMAL, VIP, COUPLE)',
    
    -- Giá ghế (có thể khác với giá cơ bản nếu là VIP/COUPLE)
    price DECIMAL(10, 2) NOT NULL COMMENT 'Giá ghế (VNĐ)',
    
    -- Trạng thái ghế: AVAILABLE, LOCKED, BOOKED
    -- AVAILABLE: Ghế trống, có thể đặt
    -- LOCKED: Ghế đang được giữ tạm thời (90 giây)
    -- BOOKED: Ghế đã được đặt và thanh toán
    status VARCHAR(20) DEFAULT 'AVAILABLE' COMMENT 'Trạng thái ghế (AVAILABLE, LOCKED, BOOKED)',
    
    -- Thời gian tạo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Thời gian cập nhật
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_seat_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE,
    
    -- Unique constraint: Mỗi ghế chỉ tồn tại 1 lần trong 1 suất chiếu
    UNIQUE KEY uk_showtime_seat (showtime_id, seat_row, seat_number),
    
    -- Indexes
    INDEX idx_showtime_id (showtime_id),
    INDEX idx_status (status),
    INDEX idx_seat_position (seat_row, seat_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng quản lý ghế ngồi trong suất chiếu';


-- ============================================================================
-- BẢNG 6: SEAT_LOCKS ⭐ CORE TABLE - Quản lý lock ghế tạm thời
-- ============================================================================
-- Mô tả: Lưu trữ thông tin về việc lock ghế tạm thời khi user đang chọn ghế
-- Vai trò: ĐÂY LÀ BẢNG QUAN TRỌNG NHẤT cho việc kiểm soát concurrency
-- Cơ chế: Khi user chọn ghế, hệ thống tạo 1 record lock với TTL 90 giây
--         Nếu user không thanh toán trong 90 giây, lock sẽ tự động expire
--         Background job sẽ xóa các lock đã hết hạn

CREATE TABLE IF NOT EXISTS seat_locks (
    -- ID tự tăng, khóa chính
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Khóa ngoại tham chiếu đến bảng seats
    seat_id BIGINT NOT NULL COMMENT 'ID ghế bị lock (FK đến bảng seats)',
    
    -- Khóa ngoại tham chiếu đến bảng users (user đang giữ ghế)
    user_id BIGINT NOT NULL COMMENT 'ID user đang giữ ghế (FK đến bảng users)',
    
    -- Thời điểm bắt đầu lock
    locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm bắt đầu lock ghế',
    
    -- Thời điểm lock sẽ hết hạn (locked_at + 90 giây)
    expires_at TIMESTAMP NOT NULL COMMENT 'Thời điểm lock hết hạn (90 giây sau locked_at)',
    
    -- Trạng thái lock: HOLDING, EXPIRED, CONFIRMED, RELEASED
    -- HOLDING: Đang giữ ghế (còn trong 90 giây)
    -- EXPIRED: Lock đã hết hạn, ghế được giải phóng
    -- CONFIRMED: User đã thanh toán, ghế chuyển sang BOOKED
    -- RELEASED: User tự bỏ chọn ghế
    status VARCHAR(20) DEFAULT 'HOLDING' COMMENT 'Trạng thái lock (HOLDING, EXPIRED, CONFIRMED, RELEASED)',
    
    -- Session ID để tracking (optional)
    session_id VARCHAR(255) COMMENT 'Session ID của user (để tracking)',
    
    -- Thời gian tạo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Thời gian cập nhật
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_lock_seat FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    CONSTRAINT fk_lock_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- ⭐⭐⭐ UNIQUE CONSTRAINT QUAN TRỌNG: Giải quyết race condition
    -- Chỉ cho phép 1 lock HOLDING trên 1 ghế tại 1 thời điểm
    -- Database sẽ tự động reject nếu có 2 user cùng cố gắng lock 1 ghế
    UNIQUE KEY uk_seat_holding (seat_id, status) 
        COMMENT 'Đảm bảo chỉ có 1 lock HOLDING trên 1 ghế tại 1 thời điểm',
    
    -- Indexes
    INDEX idx_seat_id (seat_id),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng quản lý lock ghế tạm thời - CORE TABLE cho concurrency control';


-- ============================================================================
-- BẢNG 7: BOOKINGS - Quản lý đơn đặt vé
-- ============================================================================
-- Mô tả: Lưu trữ thông tin về đơn đặt vé của người dùng
-- Vai trò: Lưu lại lịch sử booking và chi tiết đơn hàng

CREATE TABLE IF NOT EXISTS bookings (
    -- ID tự tăng, khóa chính
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Mã đơn hàng (unique, dùng để tra cứu)
    booking_code VARCHAR(20) NOT NULL UNIQUE COMMENT 'Mã đơn hàng (unique, dùng để tra cứu)',
    
    -- Khóa ngoại tham chiếu đến bảng users
    user_id BIGINT NOT NULL COMMENT 'ID người đặt vé (FK đến bảng users)',
    
    -- Khóa ngoại tham chiếu đến bảng showtimes
    showtime_id BIGINT NOT NULL COMMENT 'ID suất chiếu (FK đến bảng showtimes)',
    
    -- Danh sách ID ghế đã đặt (lưu dạng JSON array: [1,2,3])
    -- Hoặc có thể tạo bảng riêng booking_seats nếu muốn normalize
    seat_ids JSON NOT NULL COMMENT 'Danh sách ID ghế đã đặt (JSON array)',
    
    -- Tổng số tiền (VNĐ)
    total_amount DECIMAL(10, 2) NOT NULL COMMENT 'Tổng số tiền đơn hàng (VNĐ)',
    
    -- Trạng thái đơn hàng: PENDING, CONFIRMED, CANCELLED, EXPIRED
    -- PENDING: Đang chờ thanh toán (ghế đang bị lock)
    -- CONFIRMED: Đã thanh toán thành công
    -- CANCELLED: User hủy đơn
    -- EXPIRED: Quá thời gian giữ ghế (90 giây)
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'Trạng thái đơn hàng',
    
    -- Thời gian tạo đơn
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo đơn hàng',
    
    -- Thời gian xác nhận thanh toán
    confirmed_at TIMESTAMP NULL COMMENT 'Thời điểm xác nhận thanh toán',
    
    -- Thời gian hết hạn giữ ghế (created_at + 90 giây)
    hold_until TIMESTAMP NOT NULL COMMENT 'Thời điểm hết hạn giữ ghế (90 giây)',
    
    -- Phương thức thanh toán: CASH, CARD, MOMO, VNPAY, etc.
    payment_method VARCHAR(50) COMMENT 'Phương thức thanh toán',
    
    -- ID giao dịch từ cổng thanh toán (nếu có)
    payment_transaction_id VARCHAR(255) COMMENT 'ID giao dịch từ cổng thanh toán',
    
    -- Ghi chú
    notes TEXT COMMENT 'Ghi chú của khách hàng',
    
    -- Thời gian cập nhật
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_booking_code (booking_code),
    INDEX idx_user_id (user_id),
    INDEX idx_showtime_id (showtime_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_hold_until (hold_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng quản lý đơn đặt vé';


-- ============================================================================
-- BẢNG 8 (OPTIONAL): BOOKING_SEATS - Chi tiết ghế trong đơn hàng
-- ============================================================================
-- Mô tả: Nếu muốn normalize thay vì dùng JSON trong bookings.seat_ids
-- Bảng này tạo quan hệ many-to-many giữa bookings và seats

CREATE TABLE IF NOT EXISTS booking_seats (
    -- ID tự tăng, khóa chính
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Khóa ngoại tham chiếu đến bảng bookings
    booking_id BIGINT NOT NULL COMMENT 'ID đơn hàng (FK đến bảng bookings)',
    
    -- Khóa ngoại tham chiếu đến bảng seats
    seat_id BIGINT NOT NULL COMMENT 'ID ghế (FK đến bảng seats)',
    
    -- Giá ghế tại thời điểm đặt (lưu lại để tránh thay đổi sau này)
    price_at_booking DECIMAL(10, 2) NOT NULL COMMENT 'Giá ghế tại thời điểm đặt (VNĐ)',
    
    -- Thời gian tạo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_booking_seat_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_seat_seat FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    
    -- Unique constraint: Mỗi ghế chỉ thuộc về 1 booking
    UNIQUE KEY uk_booking_seat (booking_id, seat_id),
    
    -- Indexes
    INDEX idx_booking_id (booking_id),
    INDEX idx_seat_id (seat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng chi tiết ghế trong đơn hàng (normalize)';


-- ============================================================================
-- BẢNG 9 (OPTIONAL): AUDIT_LOGS - Lưu lại lịch sử thao tác
-- ============================================================================
-- Mô tả: Lưu lại tất cả các hành động quan trọng để audit và debug
-- Đặc biệt hữu ích cho việc tracking race condition và concurrency issues

CREATE TABLE IF NOT EXISTS audit_logs (
    -- ID tự tăng, khóa chính
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- ID user thực hiện hành động
    user_id BIGINT COMMENT 'ID user thực hiện hành động',
    
    -- Loại hành động: LOCK_SEAT, RELEASE_SEAT, CREATE_BOOKING, etc.
    action VARCHAR(50) NOT NULL COMMENT 'Loại hành động',
    
    -- Bảng bị ảnh hưởng
    table_name VARCHAR(50) COMMENT 'Tên bảng bị ảnh hưởng',
    
    -- ID của record bị ảnh hưởng
    record_id BIGINT COMMENT 'ID của record bị ảnh hưởng',
    
    -- Dữ liệu cũ (JSON)
    old_data JSON COMMENT 'Dữ liệu trước khi thay đổi (JSON)',
    
    -- Dữ liệu mới (JSON)
    new_data JSON COMMENT 'Dữ liệu sau khi thay đổi (JSON)',
    
    -- IP address của user
    ip_address VARCHAR(45) COMMENT 'IP address của user',
    
    -- User agent
    user_agent TEXT COMMENT 'User agent của browser',
    
    -- Thời gian thực hiện
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm thực hiện hành động',
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng audit log - Lưu lịch sử thao tác';


-- ============================================================================
-- TRIGGER: Tự động cập nhật số ghế còn trống trong showtimes
-- ============================================================================
-- Mô tả: Khi trạng thái ghế thay đổi (AVAILABLE -> BOOKED), tự động cập nhật
--        available_seats trong bảng showtimes

DELIMITER //

-- Trigger khi ghế được đặt (AVAILABLE -> BOOKED)
CREATE TRIGGER trg_seat_booked
AFTER UPDATE ON seats
FOR EACH ROW
BEGIN
    -- Nếu ghế chuyển từ AVAILABLE/LOCKED sang BOOKED
    IF OLD.status != 'BOOKED' AND NEW.status = 'BOOKED' THEN
        UPDATE showtimes 
        SET available_seats = available_seats - 1
        WHERE id = NEW.showtime_id;
    END IF;
    
    -- Nếu ghế được giải phóng (BOOKED -> AVAILABLE)
    IF OLD.status = 'BOOKED' AND NEW.status = 'AVAILABLE' THEN
        UPDATE showtimes 
        SET available_seats = available_seats + 1
        WHERE id = NEW.showtime_id;
    END IF;
END//

DELIMITER ;


-- ============================================================================
-- STORED PROCEDURE: Tự động xóa các lock đã hết hạn
-- ============================================================================
-- Mô tả: Background job sẽ gọi procedure này mỗi 30 giây để:
--        1. Tìm các lock đã hết hạn (expires_at < NOW())
--        2. Cập nhật status = 'EXPIRED'
--        3. Giải phóng ghế (seats.status = 'AVAILABLE')
--        4. Cập nhật booking status = 'EXPIRED' nếu có

DELIMITER //

CREATE PROCEDURE sp_cleanup_expired_locks()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_seat_id BIGINT;
    DECLARE v_booking_id BIGINT;
    
    -- Cursor để lấy danh sách seat_id từ các lock đã hết hạn
    DECLARE cur_expired_locks CURSOR FOR
        SELECT seat_id 
        FROM seat_locks 
        WHERE status = 'HOLDING' AND expires_at < NOW();
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Bắt đầu transaction
    START TRANSACTION;
    
    -- Mở cursor TRƯỚC khi DELETE
    OPEN cur_expired_locks;
    
    read_loop: LOOP
        FETCH cur_expired_locks INTO v_seat_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Giải phóng ghế
        UPDATE seats
        SET status = 'AVAILABLE', updated_at = NOW()
        WHERE id = v_seat_id AND status = 'LOCKED';
        
    END LOOP;
    
    CLOSE cur_expired_locks;
    
    -- XÓA các lock đã hết hạn (thay vì UPDATE sang EXPIRED)
    DELETE FROM seat_locks
    WHERE status = 'HOLDING' AND expires_at < NOW();
    
    -- Cập nhật các booking đã hết hạn
    UPDATE bookings
    SET status = 'EXPIRED', updated_at = NOW()
    WHERE status = 'PENDING' AND hold_until < NOW();
    
    -- Commit transaction
    COMMIT;
    
    -- Log kết quả
    SELECT ROW_COUNT() AS expired_locks_cleaned;
END//

DELIMITER ;


-- ============================================================================
-- VIEW: Thống kê trạng thái ghế theo suất chiếu
-- ============================================================================
-- Mô tả: View để xem nhanh thống kê ghế của mỗi suất chiếu

CREATE OR REPLACE VIEW v_showtime_seat_stats AS
SELECT 
    s.id AS showtime_id,
    m.title AS movie_title,
    c.name AS cinema_name,
    s.showtime_date,
    s.start_time,
    s.room_number,
    s.total_seats,
    s.available_seats,
    COUNT(CASE WHEN st.status = 'AVAILABLE' THEN 1 END) AS seats_available,
    COUNT(CASE WHEN st.status = 'LOCKED' THEN 1 END) AS seats_locked,
    COUNT(CASE WHEN st.status = 'BOOKED' THEN 1 END) AS seats_booked,
    ROUND(COUNT(CASE WHEN st.status = 'BOOKED' THEN 1 END) * 100.0 / s.total_seats, 2) AS occupancy_rate
FROM showtimes s
JOIN movies m ON s.movie_id = m.id
JOIN cinemas c ON s.cinema_id = c.id
LEFT JOIN seats st ON s.id = st.showtime_id
GROUP BY s.id, m.title, c.name, s.showtime_date, s.start_time, s.room_number, s.total_seats, s.available_seats;


-- ============================================================================
-- VIEW: Lịch sử booking của user
-- ============================================================================
-- Mô tả: View để xem lịch sử đặt vé của người dùng

CREATE OR REPLACE VIEW v_user_bookings AS
SELECT 
    b.id AS booking_id,
    b.booking_code,
    u.id AS user_id,
    u.name AS user_name,
    u.email AS user_email,
    m.title AS movie_title,
    c.name AS cinema_name,
    s.showtime_date,
    s.start_time,
    s.room_number,
    b.seat_ids,
    b.total_amount,
    b.status AS booking_status,
    b.payment_method,
    b.created_at,
    b.confirmed_at,
    b.hold_until
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN showtimes s ON b.showtime_id = s.id
JOIN movies m ON s.movie_id = m.id
JOIN cinemas c ON s.cinema_id = c.id
ORDER BY b.created_at DESC;


-- ============================================================================
-- KẾT THÚC SCHEMA
-- ============================================================================
-- Hướng dẫn sử dụng:
-- 1. Chạy file này để tạo toàn bộ schema
-- 2. Chạy file seed-data.sql để insert dữ liệu mẫu
-- 3. Tạo scheduled job trong Spring Boot để gọi sp_cleanup_expired_locks() mỗi 30s
-- 4. Sử dụng view v_showtime_seat_stats để monitor trạng thái ghế
-- ============================================================================
