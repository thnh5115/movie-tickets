package com.movieticket.booking.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record BookingDetailResponse(
    Long bookingId,
    String bookingCode,
    Long userId,
    Long showtimeId,
    String status,
    BigDecimal totalAmount,
    Instant createdAt,
    Instant confirmedAt,
    Instant holdUntil,
    List<Item> seats
) {
  public record Item(Long seatId, String seatRow, Integer seatNumber, BigDecimal price) {}
}
