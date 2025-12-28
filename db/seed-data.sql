-- ============================================================================
-- DỮ LIỆU MẪU CHO DEMO CONCURRENCY CONTROL
-- ============================================================================
-- Mục đích: Tạo dữ liệu mẫu để test tính năng đặt vé
-- Ngày tạo: 28/12/2025
-- ============================================================================

SET NAMES utf8mb4;

-- ============================================================================
-- 1. INSERT USERS - Tạo 2 tài khoản demo
-- ============================================================================
-- Password mặc định cho tất cả: "password123"
-- BCrypt hash của "password123": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO users (email, name, password_hash, phone, role, status) VALUES
('user1@demo.com', 'Nguyễn Văn A', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0901234567', 'USER', 'ACTIVE'),
('user2@demo.com', 'Trần Thị B', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0902234567', 'USER', 'ACTIVE'),
('admin@demo.com', 'Admin System', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0903234567', 'ADMIN', 'ACTIVE');


-- ============================================================================
-- 2. INSERT MOVIES - Tạo danh sách phim
-- ============================================================================

INSERT INTO movies (title, poster_url, duration, genre, release_date, rating, description, director, cast, language, status) VALUES
(
    'Avatar: The Way of Water',
    'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    192,
    'Action, Adventure, Science Fiction',
    '2022-12-16',
    '13+',
    'Set more than a decade after the events of the first film, Avatar: The Way of Water begins to tell the story of the Sully family, the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure.',
    'James Cameron',
    'Sam Worthington, Zoe Saldana, Sigourney Weaver, Kate Winslet',
    'English',
    'NOW_SHOWING'
),
(
    'Mai',
    'https://www.cgv.vn/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/p/o/poster_mai_1_.jpg',
    131,
    'Drama, Romance',
    '2024-02-10',
    '16+',
    'Câu chuyện về một cô gái tên Mai, người phải đối mặt với những biến cố lớn trong cuộc đời và tìm cách vượt qua.',
    'Trấn Thành',
    'Phương Anh Đào, Tuấn Trần, Hồng Đào',
    'Vietnamese',
    'NOW_SHOWING'
),
(
    'Godzilla x Kong: The New Empire',
    'https://image.tmdb.org/t/p/w500/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg',
    115,
    'Action, Science Fiction, Adventure',
    '2024-03-29',
    '13+',
    'The epic battle continues! Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world.',
    'Adam Wingard',
    'Rebecca Hall, Brian Tyree Henry, Dan Stevens',
    'English',
    'NOW_SHOWING'
),
(
    'Đào, Phở và Piano',
    'https://www.cgv.vn/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/7/0/700x1000-dao-pho.jpg',
    108,
    'Drama, War',
    '2024-02-23',
    'K',
    'Lấy bối cảnh trong những ngày Hà Nội lên đèn, phim kể về một cô gái trẻ cùng gia đình sơ tán vào căn hầm trú ẩn.',
    'Phi Tiến Sơn',
    'Cao Thái Hà, Doãn Quốc Đam',
    'Vietnamese',
    'NOW_SHOWING'
);


-- ============================================================================
-- 3. INSERT CINEMAS - Tạo danh sách rạp chiếu
-- ============================================================================

INSERT INTO cinemas (name, address, city, phone, latitude, longitude, status) VALUES
(
    'CGV Vincom Hà Nội',
    '191 Bà Triệu, Hai Bà Trưng, Hà Nội',
    'Hà Nội',
    '1900-6017',
    21.0153633,
    105.8481441,
    'ACTIVE'
),
(
    'CGV Aeon Long Biên',
    'AEON Mall Long Biên, 27 Cổ Linh, Long Biên, Hà Nội',
    'Hà Nội',
    '1900-6017',
    21.0541767,
    105.8947964,
    'ACTIVE'
),
(
    'Lotte Cinema Landmark',
    'Vinhomes Central Park, 720A Điện Biên Phủ, Bình Thạnh, TP.HCM',
    'TP. Hồ Chí Minh',
    '1900-6016',
    10.7880873,
    106.7217743,
    'ACTIVE'
),
(
    'Galaxy Nguyễn Du',
    '116 Nguyễn Du, Quận 1, TP.HCM',
    'TP. Hồ Chí Minh',
    '1900-2224',
    10.7759411,
    106.6932322,
    'ACTIVE'
);


-- ============================================================================
-- 4. INSERT SHOWTIMES - Tạo lịch chiếu phim
-- ============================================================================
-- Lưu ý: Sử dụng ngày hiện tại + 1 ngày để đảm bảo suất chiếu trong tương lai

INSERT INTO showtimes (movie_id, cinema_id, showtime_date, start_time, end_time, room_number, base_price, available_seats, total_seats, status) VALUES
-- Avatar tại CGV Vincom Hà Nội
(1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00', '12:12:00', 'P1', 85000, 120, 120, 'SCHEDULED'),
(1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '13:00:00', '16:12:00', 'P1', 100000, 120, 120, 'SCHEDULED'),
(1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '17:00:00', '20:12:00', 'P2', 120000, 150, 150, 'SCHEDULED'),
(1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '21:00:00', '00:12:00', 'P2', 120000, 150, 150, 'SCHEDULED'),

-- Mai tại CGV Aeon Long Biên
(2, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', '12:11:00', 'P3', 75000, 100, 100, 'SCHEDULED'),
(2, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '16:11:00', 'P3', 90000, 100, 100, 'SCHEDULED'),
(2, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', '20:11:00', 'P4', 110000, 120, 120, 'SCHEDULED'),

-- Godzilla x Kong tại Lotte Cinema Landmark
(3, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00:00', '12:55:00', 'P5', 95000, 140, 140, 'SCHEDULED'),
(3, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:00:00', '16:55:00', 'P5', 110000, 140, 140, 'SCHEDULED'),
(3, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:00:00', '20:55:00', 'P6', 130000, 160, 160, 'SCHEDULED'),

-- Đào, Phở và Piano tại Galaxy Nguyễn Du
(4, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:30:00', '11:18:00', 'P7', 70000, 90, 90, 'SCHEDULED'),
(4, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '13:30:00', '15:18:00', 'P7', 85000, 90, 90, 'SCHEDULED'),
(4, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '17:30:00', '19:18:00', 'P8', 100000, 110, 110, 'SCHEDULED');


-- ============================================================================
-- 5. INSERT SEATS - Tạo sơ đồ ghế cho suất chiếu
-- ============================================================================
-- Ví dụ: Tạo ghế cho suất chiếu đầu tiên (showtime_id = 1)
-- Layout: 10 hàng (A-J) x 12 ghế mỗi hàng = 120 ghế
-- Hàng A-D: NORMAL (85,000 VNĐ)
-- Hàng E-H: VIP (110,000 VNĐ)
-- Hàng I-J: COUPLE (150,000 VNĐ)

-- Stored Procedure để tạo ghế tự động cho 1 suất chiếu
DELIMITER //

CREATE PROCEDURE sp_generate_seats_for_showtime(
    IN p_showtime_id BIGINT,
    IN p_rows VARCHAR(50), -- Ví dụ: 'ABCDEFGHIJ'
    IN p_seats_per_row INT,
    IN p_normal_price DECIMAL(10,2),
    IN p_vip_price DECIMAL(10,2),
    IN p_couple_price DECIMAL(10,2)
)
BEGIN
    DECLARE row_index INT DEFAULT 1;
    DECLARE row_letter VARCHAR(1);
    DECLARE seat_num INT;
    DECLARE seat_price DECIMAL(10,2);
    DECLARE seat_type VARCHAR(20);
    DECLARE rows_length INT;
    
    SET rows_length = CHAR_LENGTH(p_rows);
    
    WHILE row_index <= rows_length DO
        SET row_letter = SUBSTRING(p_rows, row_index, 1);
        SET seat_num = 1;
        
        -- Xác định loại ghế dựa trên hàng
        IF row_index <= 4 THEN
            -- Hàng A-D: NORMAL
            SET seat_type = 'NORMAL';
            SET seat_price = p_normal_price;
        ELSEIF row_index <= 8 THEN
            -- Hàng E-H: VIP
            SET seat_type = 'VIP';
            SET seat_price = p_vip_price;
        ELSE
            -- Hàng I-J: COUPLE
            SET seat_type = 'COUPLE';
            SET seat_price = p_couple_price;
        END IF;
        
        -- Tạo ghế cho hàng này
        WHILE seat_num <= p_seats_per_row DO
            INSERT INTO seats (showtime_id, seat_row, seat_number, seat_type, price, status)
            VALUES (p_showtime_id, row_letter, seat_num, seat_type, seat_price, 'AVAILABLE');
            
            SET seat_num = seat_num + 1;
        END WHILE;
        
        SET row_index = row_index + 1;
    END WHILE;
END//

DELIMITER ;


-- Tạo ghế cho các suất chiếu
-- Suất chiếu 1: Avatar 09:00 (120 ghế)
CALL sp_generate_seats_for_showtime(1, 'ABCDEFGHIJ', 12, 85000, 110000, 150000);

-- Suất chiếu 2: Avatar 13:00 (120 ghế)
CALL sp_generate_seats_for_showtime(2, 'ABCDEFGHIJ', 12, 100000, 130000, 170000);

-- Suất chiếu 3: Avatar 17:00 (150 ghế - 10 hàng x 15 ghế)
CALL sp_generate_seats_for_showtime(3, 'ABCDEFGHIJ', 15, 120000, 150000, 200000);

-- Suất chiếu 4: Avatar 21:00 (150 ghế)
CALL sp_generate_seats_for_showtime(4, 'ABCDEFGHIJ', 15, 120000, 150000, 200000);

-- Suất chiếu 5: Mai 10:00 (100 ghế - 10 hàng x 10 ghế)
CALL sp_generate_seats_for_showtime(5, 'ABCDEFGHIJ', 10, 75000, 95000, 130000);

-- Suất chiếu 6: Mai 14:00 (100 ghế)
CALL sp_generate_seats_for_showtime(6, 'ABCDEFGHIJ', 10, 90000, 110000, 150000);

-- Suất chiếu 7: Mai 18:00 (120 ghế)
CALL sp_generate_seats_for_showtime(7, 'ABCDEFGHIJ', 12, 110000, 135000, 180000);

-- Suất chiếu 8: Godzilla x Kong 11:00 (140 ghế - 10 hàng x 14 ghế)
CALL sp_generate_seats_for_showtime(8, 'ABCDEFGHIJ', 14, 95000, 120000, 160000);

-- Suất chiếu 9: Godzilla x Kong 15:00 (140 ghế)
CALL sp_generate_seats_for_showtime(9, 'ABCDEFGHIJ', 14, 110000, 135000, 180000);

-- Suất chiếu 10: Godzilla x Kong 19:00 (160 ghế - 10 hàng x 16 ghế)
CALL sp_generate_seats_for_showtime(10, 'ABCDEFGHIJ', 16, 130000, 160000, 210000);

-- Suất chiếu 11: Đào, Phở và Piano 09:30 (90 ghế - 9 hàng x 10 ghế)
CALL sp_generate_seats_for_showtime(11, 'ABCDEFGHI', 10, 70000, 90000, 120000);

-- Suất chiếu 12: Đào, Phở và Piano 13:30 (90 ghế)
CALL sp_generate_seats_for_showtime(12, 'ABCDEFGHI', 10, 85000, 105000, 140000);

-- Suất chiếu 13: Đào, Phở và Piano 17:30 (110 ghế - 10 hàng x 11 ghế)
CALL sp_generate_seats_for_showtime(13, 'ABCDEFGHIJ', 11, 100000, 125000, 165000);


-- ============================================================================
-- 6. INSERT SAMPLE BOOKINGS - Tạo 1 vài booking mẫu đã hoàn thành
-- ============================================================================

INSERT INTO bookings (booking_code, user_id, showtime_id, seat_ids, total_amount, status, confirmed_at, hold_until, payment_method, notes) VALUES
(
    'BK-20251228-0001',
    1, -- user1@demo.com
    1, -- Avatar 09:00
    JSON_ARRAY(1, 2, 3), -- Ghế A1, A2, A3
    255000, -- 85000 x 3
    'CONFIRMED',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 90 SECOND),
    'MOMO',
    'Đặt vé cho gia đình'
),
(
    'BK-20251228-0002',
    2, -- user2@demo.com
    5, -- Mai 10:00
    JSON_ARRAY(501, 502), -- 2 ghế đầu tiên của suất chiếu 5
    150000, -- 75000 x 2
    'CONFIRMED',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 90 SECOND),
    'VNPAY',
    'Xem phim với bạn'
);

-- Cập nhật trạng thái ghế đã được book
UPDATE seats SET status = 'BOOKED' WHERE id IN (1, 2, 3);
UPDATE seats SET status = 'BOOKED' WHERE id IN (501, 502);

-- Tạo records trong booking_seats (nếu sử dụng bảng này)
INSERT INTO booking_seats (booking_id, seat_id, price_at_booking) VALUES
(1, 1, 85000),
(1, 2, 85000),
(1, 3, 85000),
(2, 501, 75000),
(2, 502, 75000);


-- ============================================================================
-- 7. INSERT SAMPLE AUDIT LOGS - Tạo audit log mẫu
-- ============================================================================

INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data, ip_address, user_agent) VALUES
(
    1,
    'CREATE_BOOKING',
    'bookings',
    1,
    NULL,
    JSON_OBJECT('booking_code', 'BK-20251228-0001', 'total_amount', 255000),
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
),
(
    1,
    'LOCK_SEAT',
    'seat_locks',
    1,
    NULL,
    JSON_OBJECT('seat_id', 1, 'status', 'HOLDING'),
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
);


-- ============================================================================
-- 8. VERIFY DATA - Kiểm tra dữ liệu đã insert
-- ============================================================================

-- Đếm số lượng records trong mỗi bảng
SELECT 'users' AS table_name, COUNT(*) AS total_records FROM users
UNION ALL
SELECT 'movies', COUNT(*) FROM movies
UNION ALL
SELECT 'cinemas', COUNT(*) FROM cinemas
UNION ALL
SELECT 'showtimes', COUNT(*) FROM showtimes
UNION ALL
SELECT 'seats', COUNT(*) FROM seats
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'booking_seats', COUNT(*) FROM booking_seats
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;


-- Hiển thị thông tin suất chiếu kèm phim và rạp
SELECT 
    s.id,
    m.title AS movie,
    c.name AS cinema,
    s.showtime_date,
    s.start_time,
    s.room_number,
    s.base_price,
    s.available_seats,
    s.total_seats
FROM showtimes s
JOIN movies m ON s.movie_id = m.id
JOIN cinemas c ON s.cinema_id = c.id
ORDER BY s.showtime_date, s.start_time;


-- ============================================================================
-- KẾT THÚC SEED DATA
-- ============================================================================
-- Hướng dẫn:
-- 1. File này sẽ được tự động chạy sau init.sql khi Docker container khởi động
-- 2. Có thể chạy lại file này để reset dữ liệu mẫu (cần truncate tables trước)
-- 3. Thông tin đăng nhập demo:
--    - user1@demo.com / password123
--    - user2@demo.com / password123
--    - admin@demo.com / password123
-- ============================================================================
