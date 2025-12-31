# movieticket

## Run
1) Start DB from your provided db.zip (docker-compose in db/ folder)
2) Update `src/main/resources/application.yml` with correct DB name/user/pass
3) Run:
   - mvn -q -DskipTests spring-boot:run

## Key endpoints
- POST /auth/login
- GET /movies/{id}
- GET /cinemas
- GET /showtimes/{id}
- GET /showtimes/{id}/seats
- POST /seats/lock      (Header: X-User-Id)
- POST /seats/release   (Header: X-User-Id)
- POST /bookings        (Header: X-User-Id)
- POST /bookings/{id}/confirm (Header: X-User-Id)
- GET /bookings/{id}    (Header: X-User-Id)

## Concurrency demo
2 users call /seats/lock for same seatId nearly at the same time.
DB unique key `uk_seat_holding(seat_id,status)` will reject one request => 409 CONFLICT.
