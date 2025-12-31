package com.movieticket.common;

/**
 * Demo-only: lấy userId từ header X-User-Id để test concurrency nhanh.
 */
public final class SecurityContext {
  private SecurityContext() {}

  public static Long requireUserId(String xUserId) {
    if (xUserId == null || xUserId.isBlank()) {
      throw new IllegalArgumentException("Missing X-User-Id header");
    }
    try {
      return Long.parseLong(xUserId.trim());
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid X-User-Id header");
    }
  }
}
