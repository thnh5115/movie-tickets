package com.movieticket.catalog;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.movieticket.catalog.dto.MovieResponse;
import com.movieticket.catalog.repo.MovieRepository;
import com.movieticket.common.ApiResponse;
import com.movieticket.domain.Movie;

@RestController
@RequestMapping("/movies")
public class MovieController {
  private final MovieRepository movieRepository;

  public MovieController(MovieRepository movieRepository) { this.movieRepository = movieRepository; }

  @GetMapping
  public ApiResponse<?> list() {
    List<MovieResponse> items = movieRepository.findAll().stream()
        .map(m -> new MovieResponse(m.getId(), m.getTitle(), m.getDuration(), m.getPosterUrl()))
        .toList();
    return ApiResponse.ok(items);
  }

  @GetMapping("/{id}")
  public ApiResponse<?> get(@PathVariable Long id) {
    Movie m = movieRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Movie not found"));
    return ApiResponse.ok(new MovieResponse(m.getId(), m.getTitle(), m.getDuration(), m.getPosterUrl()));
  }
}
