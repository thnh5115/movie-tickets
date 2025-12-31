package com.movieticket.catalog.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record SeatStatusResponse(
    Long seatId,
    String seatRow,
    Integer seatNumber,
    String seatType,
    BigDecimal price,
    String status,
    Long lockedByUserId,
    Instant lockExpiresAt
) {}
