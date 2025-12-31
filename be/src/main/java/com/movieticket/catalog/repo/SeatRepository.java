package com.movieticket.catalog.repo;

import com.movieticket.domain.Seat;
import com.movieticket.domain.enums.SeatStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SeatRepository extends JpaRepository<Seat, Long> {

  List<Seat> findByShowtime_IdOrderBySeatRowAscSeatNumberAsc(Long showtimeId);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select s from Seat s where s.id = :id")
  Optional<Seat> findByIdForUpdate(@Param("id") Long id);

  @Modifying
  @Query("update Seat s set s.status = :to where s.id = :id and s.status = :from")
  int updateStatusIfMatch(@Param("id") Long id, @Param("from") SeatStatus from, @Param("to") SeatStatus to);
}
