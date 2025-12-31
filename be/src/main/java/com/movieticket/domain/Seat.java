package com.movieticket.domain;

import com.movieticket.domain.enums.SeatStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name="seats",
  uniqueConstraints = @UniqueConstraint(name="uk_showtime_seat", columnNames = {"showtime_id","seat_row","seat_number"})
)
public class Seat {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="showtime_id", nullable=false)
  private Showtime showtime;

  @Column(name="seat_row", nullable=false, length=5)
  private String seatRow;

  @Column(name="seat_number", nullable=false)
  private Integer seatNumber;

  @Column(name="seat_type", length=20)
  private String seatType;

  @Column(name="price", nullable=false, precision=10, scale=2)
  private BigDecimal price;

  @Enumerated(EnumType.STRING)
  @Column(name="status", length=20)
  private SeatStatus status;

  @Column(name="created_at") private Instant createdAt;
  @Column(name="updated_at") private Instant updatedAt;

  public Long getId(){return id;}
  public Showtime getShowtime(){return showtime;}
  public String getSeatRow(){return seatRow;}
  public Integer getSeatNumber(){return seatNumber;}
  public String getSeatType(){return seatType;}
  public BigDecimal getPrice(){return price;}
  public SeatStatus getStatus(){return status;}
  public void setStatus(SeatStatus status){this.status=status;}
}
