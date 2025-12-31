package com.movieticket.booking;

import com.movieticket.booking.dto.LockSeatsRequest;
import com.movieticket.booking.dto.ReleaseSeatsRequest;
import com.movieticket.common.ApiResponse;
import com.movieticket.common.SecurityContext;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/seats")
public class SeatLockController {

  private final SeatLockService seatLockService;

  public SeatLockController(SeatLockService seatLockService) {
    this.seatLockService = seatLockService;
  }

  @PostMapping("/lock")
  public ApiResponse<?> lock(@RequestHeader("X-User-Id") String xUserId,
                             @Valid @RequestBody LockSeatsRequest req) {
    Long userId = SecurityContext.requireUserId(xUserId);
    return ApiResponse.ok(seatLockService.lockSeats(userId, req));
  }

  @PostMapping("/release")
  public ApiResponse<?> release(@RequestHeader("X-User-Id") String xUserId,
                                @Valid @RequestBody ReleaseSeatsRequest req) {
    Long userId = SecurityContext.requireUserId(xUserId);
    return ApiResponse.ok(seatLockService.releaseSeats(userId, req));
  }
}
