package com.movieticket.auth;

import org.springframework.stereotype.Service;

import com.movieticket.auth.dto.LoginRequest;
import com.movieticket.auth.dto.LoginResponse;
import com.movieticket.auth.repo.UserRepository;
import com.movieticket.domain.User;

@Service
public class AuthService {
  private final UserRepository userRepository;

  public AuthService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }
  public LoginResponse login(LoginRequest req) {
    User u = userRepository.findByEmail(req.email())
        .orElseThrow(() -> new IllegalArgumentException("Invalid email/password"));

    return new LoginResponse(u.getId(), u.getEmail(), u.getName(), String.valueOf(u.getId()));
  }
}
