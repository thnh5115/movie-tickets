package com.movieticket.common;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ApiResponse<Void>> badRequest(IllegalArgumentException e) {
    return ResponseEntity.badRequest().body(ApiResponse.fail("BAD_REQUEST", e.getMessage()));
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ApiResponse<Void>> conflict(DataIntegrityViolationException e) {
    return ResponseEntity.status(409).body(ApiResponse.fail("CONFLICT", "Conflict (duplicate/unique constraint)"));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Void>> serverError(Exception e) {
    return ResponseEntity.status(500).body(ApiResponse.fail("INTERNAL_ERROR", e.getMessage()));
  }
}
