package com.movieticket.booking;

import com.movieticket.booking.repo.SeatLockRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CleanupJob {

  private final SeatLockRepository seatLockRepository;

  public CleanupJob(SeatLockRepository seatLockRepository) {
    this.seatLockRepository = seatLockRepository;
  }

  @Scheduled(fixedDelay = 30000)
  public void cleanup() {
    seatLockRepository.callCleanupProcedure();
  }
}
