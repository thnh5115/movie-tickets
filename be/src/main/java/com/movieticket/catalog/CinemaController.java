package com.movieticket.catalog;

import com.movieticket.catalog.dto.CinemaResponse;
import com.movieticket.catalog.repo.CinemaRepository;
import com.movieticket.common.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cinemas")
public class CinemaController {
  private final CinemaRepository cinemaRepository;

  public CinemaController(CinemaRepository cinemaRepository) { this.cinemaRepository = cinemaRepository; }

  @GetMapping
  public ApiResponse<?> list() {
    List<CinemaResponse> items = cinemaRepository.findAll().stream()
        .map(c -> new CinemaResponse(c.getId(), c.getName(), c.getAddress()))
        .toList();
    return ApiResponse.ok(items);
  }
}
