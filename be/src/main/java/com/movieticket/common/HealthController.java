package com.movieticket.common;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health Check Endpoint
 * Dùng để test backend sau khi deploy lên Render
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

  @GetMapping
  public Map<String, Object> health() {
    Map<String, Object> response = new HashMap<>();
    response.put("status", "OK");
    response.put("message", "Backend is running!");
    response.put("timestamp", LocalDateTime.now());
    response.put("service", "Movie Tickets Booking API");
    return response;
  }
}
