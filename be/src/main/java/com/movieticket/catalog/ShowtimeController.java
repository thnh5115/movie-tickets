package com.movieticket.catalog;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.movieticket.booking.repo.SeatLockRepository;
import com.movieticket.catalog.dto.SeatStatusResponse;
import com.movieticket.catalog.dto.ShowtimeResponse;
import com.movieticket.catalog.repo.SeatRepository;
import com.movieticket.catalog.repo.ShowtimeRepository;
import com.movieticket.common.ApiResponse;
import com.movieticket.domain.Seat;
import com.movieticket.domain.SeatLock;

@RestController
@RequestMapping("/showtimes")
public class ShowtimeController {
  private final ShowtimeRepository showtimeRepository;
  private final SeatRepository seatRepository;
  private final SeatLockRepository seatLockRepository;

  public ShowtimeController(ShowtimeRepository showtimeRepository,
                            SeatRepository seatRepository,
                            SeatLockRepository seatLockRepository) {
    this.showtimeRepository = showtimeRepository;
    this.seatRepository = seatRepository;
    this.seatLockRepository = seatLockRepository;
  }

  @GetMapping
  public ApiResponse<?> list(@RequestParam(name = "movieId", required = false) Long movieId) {
    var items = showtimeRepository.findAll();
    if (movieId != null) {
      items = items.stream().filter(st -> st.getMovie().getId().equals(movieId)).toList();
    }
    List<ShowtimeResponse> resp = items.stream()
        .map(st -> new ShowtimeResponse(
            st.getId(),
            st.getMovie().getId(),
            st.getCinema().getId(),
            st.getShowtimeDate(),
            st.getStartTime(),
            st.getRoomNumber(),
            st.getBasePrice()
        ))
        .toList();
    return ApiResponse.ok(resp);
  }

  @GetMapping("/{id}")
  public ApiResponse<?> get(@PathVariable Long id) {
    var st = showtimeRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Showtime not found"));
    return ApiResponse.ok(new ShowtimeResponse(
        st.getId(),
        st.getMovie().getId(),
        st.getCinema().getId(),
        st.getShowtimeDate(),
        st.getStartTime(),
        st.getRoomNumber(),
        st.getBasePrice()
    ));
  }

  @GetMapping("/{id}/seats")
  public ApiResponse<?> seats(@PathVariable("id") Long showtimeId) {
    List<Seat> seats = seatRepository.findByShowtime_IdOrderBySeatRowAscSeatNumberAsc(showtimeId);
    Instant now = Instant.now();

    Map<Long, SeatLock> holding = new HashMap<>();
    for (Seat s : seats) {
      seatLockRepository.findValidHolding(s.getId(), now).ifPresent(sl -> holding.put(s.getId(), sl));
    }

    List<SeatStatusResponse> resp = new ArrayList<>();
    for (Seat s : seats) {
      SeatLock sl = holding.get(s.getId());
      resp.add(new SeatStatusResponse(
          s.getId(),
          s.getSeatRow(),
          s.getSeatNumber(),
          s.getSeatType(),
          s.getPrice(),
          s.getStatus().name(),
          sl == null ? null : sl.getUserId(),
          sl == null ? null : sl.getExpiresAt()
      ));
    }
    return ApiResponse.ok(resp);
  }
}
