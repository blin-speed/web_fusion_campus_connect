package com.campuscircular.backend.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name = "exchange_events")
public class ExchangeEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name = "exchange_id") private Exchange exchange;
    private String state;
    private Long actorId;
    private String note;
    private Instant createdAt;
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Exchange getExchange() { return exchange; } public void setExchange(Exchange exchange) { this.exchange = exchange; }
    public String getState() { return state; } public void setState(String state) { this.state = state; }
    public Long getActorId() { return actorId; } public void setActorId(Long actorId) { this.actorId = actorId; }
    public String getNote() { return note; } public void setNote(String note) { this.note = note; }
    public Instant getCreatedAt() { return createdAt; } public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
