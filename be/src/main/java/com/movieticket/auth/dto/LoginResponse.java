package com.movieticket.auth.dto;

public record LoginResponse(Long userId, String email, String name, String demoToken) {}
