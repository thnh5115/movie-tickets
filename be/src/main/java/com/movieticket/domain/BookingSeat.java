package com.movieticket.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name="booking_seats",
  uniqueConstraints = @UniqueConstraint(name="uk_booking_seat", columnNames = {"booking_id","seat_id"})
)
public class BookingSeat {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name="booking_id", nullable=false)
  private Long bookingId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="seat_id", nullable=false)
  private Seat seat;

  @Column(name="price_at_booking", nullable=false, precision=10, scale=2)
  private BigDecimal priceAtBooking;

  @Column(name="created_at") private Instant createdAt;

  public Long getId(){return id;}
  public Long getBookingId(){return bookingId;}
  public void setBookingId(Long bookingId){this.bookingId=bookingId;}
  public Seat getSeat(){return seat;}
  public void setSeat(Seat seat){this.seat=seat;}
  public BigDecimal getPriceAtBooking(){return priceAtBooking;}
  public void setPriceAtBooking(BigDecimal priceAtBooking){this.priceAtBooking=priceAtBooking;}
}
