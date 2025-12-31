package com.movieticket.booking.dto;

public record ConfirmBookingRequest(String paymentMethod, String paymentTransactionId) {}
