package com.campuscircular.backend.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
@Entity @Table(name = "posts")
public class Post {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name = "owner_id") private User owner;
    @ManyToOne @JoinColumn(name = "category_id") private Category category;
    @ManyToOne @JoinColumn(name = "item_type_id") private ItemType itemType;
    private String title;
    private String itemName;
    private String description;
    private String itemCondition;
    private String accessories;
    private String borrowingConditions;
    private String rateUnit;
    private BigDecimal rate;
    private BigDecimal minCharge;
    private BigDecimal securityDeposit;
    private BigDecimal lateFeePerUnit;
    private Integer maxDurationUnits;
    private BigDecimal retailValue;
    @ManyToOne @JoinColumn(name = "location_id") private Location location;
    private String pickupNote;
    private String approvalStatus;
    private String rejectionReason;
    private String availability;
    private Boolean flagged;
    private String flagReason;
    private Instant createdAt;
    // Getters and Setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public User getOwner() { return owner; } public void setOwner(User owner) { this.owner = owner; }
    public Category getCategory() { return category; } public void setCategory(Category category) { this.category = category; }
    public ItemType getItemType() { return itemType; } public void setItemType(ItemType itemType) { this.itemType = itemType; }
    public String getTitle() { return title; } public void setTitle(String title) { this.title = title; }
    public String getItemName() { return itemName; } public void setItemName(String itemName) { this.itemName = itemName; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public String getItemCondition() { return itemCondition; } public void setItemCondition(String itemCondition) { this.itemCondition = itemCondition; }
    public String getAccessories() { return accessories; } public void setAccessories(String accessories) { this.accessories = accessories; }
    public String getBorrowingConditions() { return borrowingConditions; } public void setBorrowingConditions(String borrowingConditions) { this.borrowingConditions = borrowingConditions; }
    public String getRateUnit() { return rateUnit; } public void setRateUnit(String rateUnit) { this.rateUnit = rateUnit; }
    public BigDecimal getRate() { return rate; } public void setRate(BigDecimal rate) { this.rate = rate; }
    public BigDecimal getMinCharge() { return minCharge; } public void setMinCharge(BigDecimal minCharge) { this.minCharge = minCharge; }
    public BigDecimal getSecurityDeposit() { return securityDeposit; } public void setSecurityDeposit(BigDecimal securityDeposit) { this.securityDeposit = securityDeposit; }
    public BigDecimal getLateFeePerUnit() { return lateFeePerUnit; } public void setLateFeePerUnit(BigDecimal lateFeePerUnit) { this.lateFeePerUnit = lateFeePerUnit; }
    public Integer getMaxDurationUnits() { return maxDurationUnits; } public void setMaxDurationUnits(Integer maxDurationUnits) { this.maxDurationUnits = maxDurationUnits; }
    public BigDecimal getRetailValue() { return retailValue; } public void setRetailValue(BigDecimal retailValue) { this.retailValue = retailValue; }
    public Location getLocation() { return location; } public void setLocation(Location location) { this.location = location; }
    public String getPickupNote() { return pickupNote; } public void setPickupNote(String pickupNote) { this.pickupNote = pickupNote; }
    public String getApprovalStatus() { return approvalStatus; } public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
    public String getRejectionReason() { return rejectionReason; } public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public String getAvailability() { return availability; } public void setAvailability(String availability) { this.availability = availability; }
    public Boolean getFlagged() { return flagged; } public void setFlagged(Boolean flagged) { this.flagged = flagged; }
    public String getFlagReason() { return flagReason; } public void setFlagReason(String flagReason) { this.flagReason = flagReason; }
    public Instant getCreatedAt() { return createdAt; } public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
