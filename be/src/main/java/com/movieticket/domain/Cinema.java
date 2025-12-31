package com.movieticket.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="cinemas")
public class Cinema {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name="name", nullable=false, length=200)
  private String name;

  @Column(name="address", nullable=false, length=500)
  private String address;

  @Column(name="city", length=100) private String city;
  @Column(name="phone", length=20) private String phone;

  @Column(name="latitude") private Double latitude;
  @Column(name="longitude") private Double longitude;

  @Column(name="status", length=20) private String status;

  @Column(name="created_at") private Instant createdAt;
  @Column(name="updated_at") private Instant updatedAt;

  public Long getId(){return id;}
  public String getName(){return name;}
  public String getAddress(){return address;}
}
