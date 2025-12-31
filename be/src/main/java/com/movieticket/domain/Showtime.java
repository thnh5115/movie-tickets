package com.movieticket.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name="showtimes")
public class Showtime {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="movie_id", nullable=false)
  private Movie movie;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="cinema_id", nullable=false)
  private Cinema cinema;

  @Column(name="showtime_date", nullable=false)
  private LocalDate showtimeDate;

  @Column(name="start_time", nullable=false)
  private LocalTime startTime;

  @Column(name="room_number", length=20) private String roomNumber;

  @Column(name="available_seats") private Integer availableSeats;
  @Column(name="total_seats") private Integer totalSeats;

  @Column(name="status", length=20) private String status;

  @Column(name="created_at") private Instant createdAt;
  @Column(name="updated_at") private Instant updatedAt;

  public Long getId(){return id;}
  public Movie getMovie(){return movie;}
  public Cinema getCinema(){return cinema;}
  public LocalDate getShowtimeDate(){return showtimeDate;}
  public LocalTime getStartTime(){return startTime;}
  public String getRoomNumber(){return roomNumber;}
}
