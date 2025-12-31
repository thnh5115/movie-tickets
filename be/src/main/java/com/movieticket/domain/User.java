package com.movieticket.domain;

import com.movieticket.domain.enums.UserRole;
import com.movieticket.domain.enums.UserStatus;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name="email", nullable=false, unique=true, length=100)
  private String email;

  @Column(name="name", nullable=false, length=100)
  private String name;

  @Column(name="password_hash", nullable=false, length=255)
  private String passwordHash;

  @Column(name="phone", length=20)
  private String phone;

  @Enumerated(EnumType.STRING)
  @Column(name="role", nullable=false, length=20)
  private UserRole role;

  @Enumerated(EnumType.STRING)
  @Column(name="status", nullable=false, length=20)
  private UserStatus status;

  @Column(name="created_at") private Instant createdAt;
  @Column(name="updated_at") private Instant updatedAt;

  public Long getId() { return id; }
  public String getEmail() { return email; }
  public String getName() { return name; }
  public String getPasswordHash() { return passwordHash; }
  public UserRole getRole() { return role; }
  public UserStatus getStatus() { return status; }
}
