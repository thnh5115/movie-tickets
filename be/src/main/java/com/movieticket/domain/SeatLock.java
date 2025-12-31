package com.movieticket.domain;

import com.movieticket.domain.enums.SeatLockStatus;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="seat_locks",
  uniqueConstraints = @UniqueConstraint(name="uk_seat_holding", columnNames = {"seat_id","status"})
)
public class SeatLock {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="seat_id", nullable=false)
  private Seat seat;

  @Column(name="user_id", nullable=false)
  private Long userId;

  @Column(name="locked_at") private Instant lockedAt;

  @Column(name="expires_at", nullable=false)
  private Instant expiresAt;

  @Enumerated(EnumType.STRING)
  @Column(name="status", length=20)
  private SeatLockStatus status;

  @Column(name="session_id", length=255)
  private String sessionId;

  @Column(name="created_at") private Instant createdAt;
  @Column(name="updated_at") private Instant updatedAt;

  public Long getId(){return id;}
  public Seat getSeat(){return seat;}
  public void setSeat(Seat seat){this.seat=seat;}
  public Long getUserId(){return userId;}
  public void setUserId(Long userId){this.userId=userId;}
  public Instant getExpiresAt(){return expiresAt;}
  public void setExpiresAt(Instant expiresAt){this.expiresAt=expiresAt;}
  public SeatLockStatus getStatus(){return status;}
  public void setStatus(SeatLockStatus status){this.status=status;}
  public void setSessionId(String sessionId){this.sessionId=sessionId;}
}
