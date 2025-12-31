package com.movieticket.booking.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record LockSeatsRequest(@NotEmpty List<Long> seatIds, String sessionId) {}
