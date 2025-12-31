package com.movieticket.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="movies")
public class Movie {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name="title", nullable=false, length=200)
  private String title;

  @Column(name="poster_url", length=500)
  private String posterUrl;

  @Column(name="duration") private Integer duration;
  @Column(name="genre", length=100) private String genre;

  @Column(name="description", columnDefinition="TEXT") private String description;
  @Column(name="director", length=100) private String director;

  @Column(name="cast", columnDefinition="TEXT") private String cast;
  @Column(name="language", length=50) private String language;

  @Column(name="status", length=20) private String status;

  @Column(name="created_at") private Instant createdAt;
  @Column(name="updated_at") private Instant updatedAt;

  public Long getId(){return id;}
  public String getTitle(){return title;}
  public Integer getDuration(){return duration;}
  public String getPosterUrl(){return posterUrl;}
}
