package com.movieticket.booking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.movieticket.booking.dto.*;
import com.movieticket.booking.repo.BookingRepository;
import com.movieticket.booking.repo.BookingSeatRepository;
import com.movieticket.booking.repo.SeatLockRepository;
import com.movieticket.catalog.repo.SeatRepository;
import com.movieticket.catalog.repo.ShowtimeRepository;
import com.movieticket.domain.Booking;
import com.movieticket.domain.BookingSeat;
import com.movieticket.domain.Seat;
import com.movieticket.domain.Showtime;
import com.movieticket.domain.enums.BookingStatus;
import com.movieticket.domain.enums.SeatLockStatus;
import com.movieticket.domain.enums.SeatStatus;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookingService {

  private static final Duration HOLD_TTL = Duration.ofSeconds(90);

  private final ShowtimeRepository showtimeRepository;
  private final SeatRepository seatRepository;
  private final SeatLockRepository seatLockRepository;
  private final BookingRepository bookingRepository;
  private final BookingSeatRepository bookingSeatRepository;

  private final ObjectMapper mapper = new ObjectMapper();

  public BookingService(ShowtimeRepository showtimeRepository,
                        SeatRepository seatRepository,
                        SeatLockRepository seatLockRepository,
                        BookingRepository bookingRepository,
                        BookingSeatRepository bookingSeatRepository) {
    this.showtimeRepository = showtimeRepository;
    this.seatRepository = seatRepository;
    this.seatLockRepository = seatLockRepository;
    this.bookingRepository = bookingRepository;
    this.bookingSeatRepository = bookingSeatRepository;
  }

  @Transactional
  public BookingResponse create(Long userId, CreateBookingRequest req) {
    Showtime st = showtimeRepository.findById(req.showtimeId())
        .orElseThrow(() -> new IllegalArgumentException("Showtime not found"));

    Instant now = Instant.now();
    Instant holdUntil = now.plus(HOLD_TTL);

    List<Long> seatIds = req.seatIds();
    BigDecimal total = BigDecimal.ZERO;

    for (Long seatId : seatIds) {
      Seat seat = seatRepository.findByIdForUpdate(seatId)
          .orElseThrow(() -> new IllegalArgumentException("Seat not found: " + seatId));

      if (!Objects.equals(seat.getShowtime().getId(), req.showtimeId())) {
        throw new IllegalArgumentException("Seat not in this showtime: " + seatId);
      }
      if (seat.getStatus() == SeatStatus.BOOKED) {
        throw new IllegalArgumentException("Seat BOOKED: " + seatId);
      }

      var lock = seatLockRepository.findValidHolding(seatId, now)
          .orElseThrow(() -> new IllegalArgumentException("Seat not locked or lock expired: " + seatId));

      if (!Objects.equals(lock.getUserId(), userId)) {
        throw new IllegalArgumentException("Seat locked by another user: " + seatId);
      }

      total = total.add(seat.getPrice());
    }

    Booking b = new Booking();
    b.setBookingCode(genCode());
    b.setUserId(userId);
    b.setShowtime(st);
    b.setTotalAmount(total);
    b.setStatus(BookingStatus.PENDING);
    b.setHoldUntil(holdUntil);
    b.setNotes(req.notes());

    try {
      b.setSeatIdsJson(mapper.writeValueAsString(seatIds));
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid seatIds");
    }

    Booking saved = bookingRepository.save(b);

    for (Long seatId : seatIds) {
      Seat seat = seatRepository.findById(seatId).orElseThrow();
      BookingSeat bs = new BookingSeat();
      bs.setBookingId(saved.getId());
      bs.setSeat(seat);
      bs.setPriceAtBooking(seat.getPrice());
      bookingSeatRepository.save(bs);
    }

    return new BookingResponse(
        saved.getId(),
        saved.getBookingCode(),
        saved.getStatus().name(),
        saved.getShowtime().getId(),
        seatIds,
        saved.getTotalAmount(),
        saved.getHoldUntil(),
        saved.getCreatedAt()
    );
  }

  @Transactional
  public BookingResponse confirm(Long userId, Long bookingId, ConfirmBookingRequest req) {
    Booking b = bookingRepository.findById(bookingId)
        .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

    if (!Objects.equals(b.getUserId(), userId)) throw new IllegalArgumentException("Forbidden");
    if (b.getStatus() != BookingStatus.PENDING) throw new IllegalArgumentException("Booking not PENDING");

    Instant now = Instant.now();
    if (b.getHoldUntil() != null && b.getHoldUntil().isBefore(now)) {
      b.setStatus(BookingStatus.EXPIRED);
      throw new IllegalArgumentException("Booking expired");
    }

    List<BookingSeat> items = bookingSeatRepository.findByBookingId(bookingId);
    for (BookingSeat item : items) {
      Long seatId = item.getSeat().getId();
      Seat seat = seatRepository.findByIdForUpdate(seatId).orElseThrow();

      seat.setStatus(SeatStatus.BOOKED);
      seatLockRepository.updateStatus(seatId, userId, SeatLockStatus.HOLDING, SeatLockStatus.CONFIRMED);
    }

    b.setStatus(BookingStatus.CONFIRMED);
    b.setConfirmedAt(now);
    b.setPaymentMethod(req.paymentMethod());
    b.setPaymentTransactionId(req.paymentTransactionId());

    List<Long> seatIds = items.stream().map(i -> i.getSeat().getId()).collect(Collectors.toList());

    return new BookingResponse(
        b.getId(),
        b.getBookingCode(),
        b.getStatus().name(),
        b.getShowtime().getId(),
        seatIds,
        b.getTotalAmount(),
        b.getHoldUntil(),
        b.getCreatedAt()
    );
  }

  public BookingDetailResponse get(Long userId, Long bookingId) {
    Booking b = bookingRepository.findById(bookingId)
        .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
    if (!Objects.equals(b.getUserId(), userId)) throw new IllegalArgumentException("Forbidden");

    List<BookingSeat> items = bookingSeatRepository.findByBookingId(bookingId);
    List<BookingDetailResponse.Item> seats = items.stream()
        .map(i -> new BookingDetailResponse.Item(
            i.getSeat().getId(),
            i.getSeat().getSeatRow(),
            i.getSeat().getSeatNumber(),
            i.getPriceAtBooking()
        ))
        .collect(Collectors.toList());

    return new BookingDetailResponse(
        b.getId(),
        b.getBookingCode(),
        b.getUserId(),
        b.getShowtime().getId(),
        b.getStatus().name(),
        b.getTotalAmount(),
        b.getCreatedAt(),
        b.getConfirmedAt(),
        b.getHoldUntil(),
        seats
    );
  }

  private String genCode() {
    return "BK" + System.currentTimeMillis(); // VARCHAR(20)
  }
}
