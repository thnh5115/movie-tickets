package com.movieticket.auth;

import com.movieticket.auth.dto.LoginRequest;
import com.movieticket.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
  private final AuthService authService;

  public AuthController(AuthService authService) { this.authService = authService; }

  @PostMapping("/login")
  public ApiResponse<?> login(@Valid @RequestBody LoginRequest req) {
    return ApiResponse.ok(authService.login(req));
  }
}
