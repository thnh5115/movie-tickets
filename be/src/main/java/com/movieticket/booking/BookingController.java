package com.movieticket.booking;

import com.movieticket.booking.dto.*;
import com.movieticket.common.ApiResponse;
import com.movieticket.common.SecurityContext;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
@RequestMapping("/bookings")
public class BookingController {

  private final BookingService bookingService;

  public BookingController(BookingService bookingService) {
    this.bookingService = bookingService;
  }

  @PostMapping
  public ApiResponse<?> create(@RequestHeader("X-User-Id") String xUserId,
                               @Valid @RequestBody CreateBookingRequest req) {
    Long userId = SecurityContext.requireUserId(xUserId);
    return ApiResponse.ok(bookingService.create(userId, req));
  }

  @PostMapping("/{id}/confirm")
  public ApiResponse<?> confirm(@RequestHeader("X-User-Id") String xUserId,
                                @PathVariable("id") Long bookingId,
                                @RequestBody ConfirmBookingRequest req) {
    Long userId = SecurityContext.requireUserId(xUserId);
    return ApiResponse.ok(bookingService.confirm(userId, bookingId, req));
  }

  @GetMapping("/{id}")
  public ApiResponse<?> detail(@RequestHeader("X-User-Id") String xUserId,
                               @PathVariable("id") Long bookingId) {
    Long userId = SecurityContext.requireUserId(xUserId);
    return ApiResponse.ok(bookingService.get(userId, bookingId));
  }

  @GetMapping("/user/{userId}")
  public ApiResponse<?> getUserBookings(@RequestHeader("X-User-Id") String xUserId,
                                        @PathVariable("userId") Long userId) {
    Long requestUserId = SecurityContext.requireUserId(xUserId);
    if (!Objects.equals(requestUserId, userId)) {
      throw new IllegalArgumentException("Forbidden: Cannot access other user's bookings");
    }
    return ApiResponse.ok(bookingService.getByUserId(userId));
  }

  @PostMapping("/{id}/cancel")
  public ApiResponse<?> cancel(@RequestHeader("X-User-Id") String xUserId,
                               @PathVariable("id") Long bookingId) {
    Long userId = SecurityContext.requireUserId(xUserId);
    bookingService.cancel(userId, bookingId);
    return ApiResponse.ok("Booking cancelled successfully");
  }
}
