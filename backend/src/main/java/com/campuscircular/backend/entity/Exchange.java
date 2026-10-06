package com.campuscircular.backend.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
@Entity @Table(name = "exchanges")
public class Exchange {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne @JoinColumn(name = "request_id") private Request request;
    @ManyToOne @JoinColumn(name = "post_id") private Post post;
    @ManyToOne @JoinColumn(name = "owner_id") private User owner;
    @ManyToOne @JoinColumn(name = "borrower_id") private User borrower;
    private String state;
    private Instant startAt;
    private Instant dueAt;
    private Instant handedOverAt;
    private Instant returnedAt;
    private Integer units;
    private String rateUnit;
    private BigDecimal borrowingCharge;
    private BigDecimal platformFeePercent;
    private BigDecimal platformFee;
    private BigDecimal securityDeposit;
    private BigDecimal transactionAmount;
    private BigDecimal lateFeePerUnit;
    private Integer lateUnits;
    private BigDecimal lateFee;
    private BigDecimal damageDeduction;
    private BigDecimal depositRefund;
    private BigDecimal extraDue;
    private BigDecimal ownerPayout;
    @ManyToOne @JoinColumn(name = "pickup_location_id") private Location pickupLocation;
    @ManyToOne @JoinColumn(name = "dropoff_location_id") private Location dropoffLocation;
    private String conditionBefore;
    private String conditionAfter;
    private String damageClaim;
    @Column(columnDefinition = "TINYINT") private Integer rating;
    private String review;
    private Instant createdAt;
    private Instant updatedAt;
    // Getters and Setters omitted for brevity but standard
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Request getRequest() { return request; } public void setRequest(Request request) { this.request = request; }
    public Post getPost() { return post; } public void setPost(Post post) { this.post = post; }
    public User getOwner() { return owner; } public void setOwner(User owner) { this.owner = owner; }
    public User getBorrower() { return borrower; } public void setBorrower(User borrower) { this.borrower = borrower; }
    public String getState() { return state; } public void setState(String state) { this.state = state; }
    public Instant getStartAt() { return startAt; } public void setStartAt(Instant startAt) { this.startAt = startAt; }
    public Instant getDueAt() { return dueAt; } public void setDueAt(Instant dueAt) { this.dueAt = dueAt; }
    public Instant getHandedOverAt() { return handedOverAt; } public void setHandedOverAt(Instant handedOverAt) { this.handedOverAt = handedOverAt; }
    public Instant getReturnedAt() { return returnedAt; } public void setReturnedAt(Instant returnedAt) { this.returnedAt = returnedAt; }
    public Integer getUnits() { return units; } public void setUnits(Integer units) { this.units = units; }
    public String getRateUnit() { return rateUnit; } public void setRateUnit(String rateUnit) { this.rateUnit = rateUnit; }
    public BigDecimal getBorrowingCharge() { return borrowingCharge; } public void setBorrowingCharge(BigDecimal borrowingCharge) { this.borrowingCharge = borrowingCharge; }
    public BigDecimal getPlatformFeePercent() { return platformFeePercent; } public void setPlatformFeePercent(BigDecimal platformFeePercent) { this.platformFeePercent = platformFeePercent; }
    public BigDecimal getPlatformFee() { return platformFee; } public void setPlatformFee(BigDecimal platformFee) { this.platformFee = platformFee; }
    public BigDecimal getSecurityDeposit() { return securityDeposit; } public void setSecurityDeposit(BigDecimal securityDeposit) { this.securityDeposit = securityDeposit; }
    public BigDecimal getTransactionAmount() { return transactionAmount; } public void setTransactionAmount(BigDecimal transactionAmount) { this.transactionAmount = transactionAmount; }
    public BigDecimal getLateFeePerUnit() { return lateFeePerUnit; } public void setLateFeePerUnit(BigDecimal lateFeePerUnit) { this.lateFeePerUnit = lateFeePerUnit; }
    public Integer getLateUnits() { return lateUnits; } public void setLateUnits(Integer lateUnits) { this.lateUnits = lateUnits; }
    public BigDecimal getLateFee() { return lateFee; } public void setLateFee(BigDecimal lateFee) { this.lateFee = lateFee; }
    public BigDecimal getDamageDeduction() { return damageDeduction; } public void setDamageDeduction(BigDecimal damageDeduction) { this.damageDeduction = damageDeduction; }
    public BigDecimal getDepositRefund() { return depositRefund; } public void setDepositRefund(BigDecimal depositRefund) { this.depositRefund = depositRefund; }
    public BigDecimal getExtraDue() { return extraDue; } public void setExtraDue(BigDecimal extraDue) { this.extraDue = extraDue; }
    public BigDecimal getOwnerPayout() { return ownerPayout; } public void setOwnerPayout(BigDecimal ownerPayout) { this.ownerPayout = ownerPayout; }
    public Location getPickupLocation() { return pickupLocation; } public void setPickupLocation(Location pickupLocation) { this.pickupLocation = pickupLocation; }
    public Location getDropoffLocation() { return dropoffLocation; } public void setDropoffLocation(Location dropoffLocation) { this.dropoffLocation = dropoffLocation; }
    public String getConditionBefore() { return conditionBefore; } public void setConditionBefore(String conditionBefore) { this.conditionBefore = conditionBefore; }
    public String getConditionAfter() { return conditionAfter; } public void setConditionAfter(String conditionAfter) { this.conditionAfter = conditionAfter; }
    public String getDamageClaim() { return damageClaim; } public void setDamageClaim(String damageClaim) { this.damageClaim = damageClaim; }
    public Integer getRating() { return rating; } public void setRating(Integer rating) { this.rating = rating; }
    public String getReview() { return review; } public void setReview(String review) { this.review = review; }
    public Instant getCreatedAt() { return createdAt; } public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; } public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

