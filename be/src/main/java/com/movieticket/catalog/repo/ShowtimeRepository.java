package com.movieticket.catalog.repo;

import com.movieticket.domain.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {}
