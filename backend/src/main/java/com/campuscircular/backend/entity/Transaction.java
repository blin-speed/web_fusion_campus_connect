package com.campuscircular.backend.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
@Entity @Table(name = "transactions")
public class Transaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name = "exchange_id") private Exchange exchange;
    private String type;
    private BigDecimal amount;
    private Instant createdAt;
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Exchange getExchange() { return exchange; } public void setExchange(Exchange exchange) { this.exchange = exchange; }
    public String getType() { return type; } public void setType(String type) { this.type = type; }
    public BigDecimal getAmount() { return amount; } public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Instant getCreatedAt() { return createdAt; } public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
