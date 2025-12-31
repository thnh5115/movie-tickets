package com.movieticket.booking.repo;

import com.movieticket.domain.SeatLock;
import com.movieticket.domain.enums.SeatLockStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

public interface SeatLockRepository extends JpaRepository<SeatLock, Long> {

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select sl from SeatLock sl where sl.seat.id = :seatId and sl.status = com.movieticket.domain.enums.SeatLockStatus.HOLDING")
  Optional<SeatLock> findHoldingForUpdate(@Param("seatId") Long seatId);

  @Query("select sl from SeatLock sl where sl.seat.id = :seatId and sl.status = com.movieticket.domain.enums.SeatLockStatus.HOLDING and sl.expiresAt > :now")
  Optional<SeatLock> findValidHolding(@Param("seatId") Long seatId, @Param("now") Instant now);

  @Modifying
  @Transactional
  @Query("update SeatLock sl set sl.status = :to where sl.seat.id = :seatId and sl.userId = :userId and sl.status = :from")
  int updateStatus(@Param("seatId") Long seatId,
                   @Param("userId") Long userId,
                   @Param("from") SeatLockStatus from,
                   @Param("to") SeatLockStatus to);

  @Modifying
  @Transactional
  @Query("update SeatLock sl set sl.status = com.movieticket.domain.enums.SeatLockStatus.EXPIRED where sl.status = com.movieticket.domain.enums.SeatLockStatus.HOLDING and sl.expiresAt <= :now")
  int expireAll(@Param("now") Instant now);

  @Transactional
  @Query(value = "CALL sp_cleanup_expired_locks()", nativeQuery = true)
  void callCleanupProcedure();
}
