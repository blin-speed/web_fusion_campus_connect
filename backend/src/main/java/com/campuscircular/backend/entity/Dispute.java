package com.campuscircular.backend.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
@Entity @Table(name = "disputes")
public class Dispute {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name = "exchange_id") private Exchange exchange;
    @ManyToOne @JoinColumn(name = "raised_by") private User raisedBy;
    private String kind;
    private String reason;
    private BigDecimal claimedAmount;
    private String status;
    private String resolution;
    private BigDecimal finalDeduction;
    private String adminNote;
    private Instant createdAt;
    private Instant resolvedAt;
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Exchange getExchange() { return exchange; } public void setExchange(Exchange exchange) { this.exchange = exchange; }
    public User getRaisedBy() { return raisedBy; } public void setRaisedBy(User raisedBy) { this.raisedBy = raisedBy; }
    public String getKind() { return kind; } public void setKind(String kind) { this.kind = kind; }
    public String getReason() { return reason; } public void setReason(String reason) { this.reason = reason; }
    public BigDecimal getClaimedAmount() { return claimedAmount; } public void setClaimedAmount(BigDecimal claimedAmount) { this.claimedAmount = claimedAmount; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public String getResolution() { return resolution; } public void setResolution(String resolution) { this.resolution = resolution; }
    public BigDecimal getFinalDeduction() { return finalDeduction; } public void setFinalDeduction(BigDecimal finalDeduction) { this.finalDeduction = finalDeduction; }
    public String getAdminNote() { return adminNote; } public void setAdminNote(String adminNote) { this.adminNote = adminNote; }
    public Instant getCreatedAt() { return createdAt; } public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getResolvedAt() { return resolvedAt; } public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
}
