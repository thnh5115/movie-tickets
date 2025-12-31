package com.movieticket.booking.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record BookingResponse(
    Long bookingId,
    String bookingCode,
    String status,
    Long showtimeId,
    List<Long> seatIds,
    BigDecimal totalAmount,
    Instant holdUntil,
    Instant createdAt
) {}
