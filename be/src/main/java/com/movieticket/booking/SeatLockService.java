package com.movieticket.booking;

import com.movieticket.booking.dto.LockSeatsRequest;
import com.movieticket.booking.dto.ReleaseSeatsRequest;
import com.movieticket.booking.repo.SeatLockRepository;
import com.movieticket.catalog.repo.SeatRepository;
import com.movieticket.domain.Seat;
import com.movieticket.domain.SeatLock;
import com.movieticket.domain.enums.SeatLockStatus;
import com.movieticket.domain.enums.SeatStatus;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
public class SeatLockService {

  private static final Duration TTL = Duration.ofSeconds(90);

  private final SeatRepository seatRepository;
  private final SeatLockRepository seatLockRepository;

  public SeatLockService(SeatRepository seatRepository, SeatLockRepository seatLockRepository) {
    this.seatRepository = seatRepository;
    this.seatLockRepository = seatLockRepository;
  }

  @Transactional
  public Map<String, Object> lockSeats(Long userId, LockSeatsRequest req) {
    Instant now = Instant.now();
    Instant exp = now.plus(TTL);

    for (Long seatId : req.seatIds()) {
      Seat seat = seatRepository.findByIdForUpdate(seatId)
          .orElseThrow(() -> new IllegalArgumentException("Seat not found: " + seatId));

      if (seat.getStatus() == SeatStatus.BOOKED) {
        throw new IllegalArgumentException("Seat already BOOKED: " + seatId);
      }

      Optional<SeatLock> valid = seatLockRepository.findValidHolding(seatId, now);
      if (valid.isPresent()) {
        SeatLock sl = valid.get();
        if (!Objects.equals(sl.getUserId(), userId)) {
          throw new IllegalArgumentException("Seat is locked by another user: " + seatId);
        }
        sl.setExpiresAt(exp); // gia hạn
        continue;
      }

      SeatLock sl = new SeatLock();
      sl.setSeat(seat);
      sl.setUserId(userId);
      sl.setStatus(SeatLockStatus.HOLDING);
      sl.setExpiresAt(exp);
      sl.setSessionId(req.sessionId());
      seatLockRepository.save(sl);

      seat.setStatus(SeatStatus.LOCKED);
    }

    return Map.of("seatIds", req.seatIds(), "ttlSeconds", TTL.getSeconds());
  }

  @Transactional
  public Map<String, Object> releaseSeats(Long userId, ReleaseSeatsRequest req) {
    Instant now = Instant.now();
    int released = 0;

    for (Long seatId : req.seatIds()) {
      Seat seat = seatRepository.findByIdForUpdate(seatId)
          .orElseThrow(() -> new IllegalArgumentException("Seat not found: " + seatId));

      Optional<SeatLock> valid = seatLockRepository.findValidHolding(seatId, now);
      if (valid.isEmpty()) continue;

      SeatLock sl = valid.get();
      if (!Objects.equals(sl.getUserId(), userId)) continue;

      seatLockRepository.updateStatus(seatId, userId, SeatLockStatus.HOLDING, SeatLockStatus.RELEASED);
      if (seat.getStatus() == SeatStatus.LOCKED) seat.setStatus(SeatStatus.AVAILABLE);
      released++;
    }

    return Map.of("releasedCount", released);
  }
}
