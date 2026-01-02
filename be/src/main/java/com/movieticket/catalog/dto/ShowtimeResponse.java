package com.movieticket.catalog.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record ShowtimeResponse(
    Long id,
    Long movieId,
    Long cinemaId,
    LocalDate showtimeDate,
    LocalTime startTime,
    String roomNumber,
    java.math.BigDecimal price
) {}
