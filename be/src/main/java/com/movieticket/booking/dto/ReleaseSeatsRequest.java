package com.movieticket.booking.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record ReleaseSeatsRequest(@NotEmpty List<Long> seatIds) {}
