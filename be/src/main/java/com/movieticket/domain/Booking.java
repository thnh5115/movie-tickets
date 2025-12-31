package com.movieticket.domain;

import com.movieticket.domain.enums.BookingStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name="bookings")
public class Booking {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name="booking_code", nullable=false, unique=true, length=20)
  private String bookingCode;

  @Column(name="user_id", nullable=false)
  private Long userId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="showtime_id", nullable=false)
  private Showtime showtime;

  @Column(name="seat_ids", nullable=false, columnDefinition="JSON")
  private String seatIdsJson;

  @Column(name="total_amount", nullable=false, precision=10, scale=2)
  private BigDecimal totalAmount;

  @Enumerated(EnumType.STRING)
  @Column(name="status", length=20)
  private BookingStatus status;

  @Column(name="created_at") private Instant createdAt;
  @Column(name="confirmed_at") private Instant confirmedAt;

  @Column(name="hold_until", nullable=false) private Instant holdUntil;

  @Column(name="payment_method", length=50) private String paymentMethod;
  @Column(name="payment_transaction_id", length=255) private String paymentTransactionId;

  @Column(name="notes", columnDefinition="TEXT") private String notes;
  @Column(name="updated_at") private Instant updatedAt;

  public Long getId(){return id;}
  public String getBookingCode(){return bookingCode;}
  public void setBookingCode(String bookingCode){this.bookingCode=bookingCode;}
  public Long getUserId(){return userId;}
  public void setUserId(Long userId){this.userId=userId;}
  public Showtime getShowtime(){return showtime;}
  public void setShowtime(Showtime showtime){this.showtime=showtime;}
  public String getSeatIdsJson(){return seatIdsJson;}
  public void setSeatIdsJson(String seatIdsJson){this.seatIdsJson=seatIdsJson;}
  public BigDecimal getTotalAmount(){return totalAmount;}
  public void setTotalAmount(BigDecimal totalAmount){this.totalAmount=totalAmount;}
  public BookingStatus getStatus(){return status;}
  public void setStatus(BookingStatus status){this.status=status;}
  public Instant getCreatedAt(){return createdAt;}
  public Instant getConfirmedAt(){return confirmedAt;}
  public void setConfirmedAt(Instant confirmedAt){this.confirmedAt=confirmedAt;}
  public Instant getHoldUntil(){return holdUntil;}
  public void setHoldUntil(Instant holdUntil){this.holdUntil=holdUntil;}
  public void setPaymentMethod(String paymentMethod){this.paymentMethod=paymentMethod;}
  public void setPaymentTransactionId(String paymentTransactionId){this.paymentTransactionId=paymentTransactionId;}
  public void setNotes(String notes){this.notes=notes;}
}
