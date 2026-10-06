package com.campuscircular.backend.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name = "demand_requests")
public class DemandRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name = "requester_id") private User requester;
    @ManyToOne @JoinColumn(name = "category_id") private Category category;
    private String title;
    private String description;
    private String status;
    private Long fulfilledByPostId;
    private Instant createdAt;
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public User getRequester() { return requester; } public void setRequester(User requester) { this.requester = requester; }
    public Category getCategory() { return category; } public void setCategory(Category category) { this.category = category; }
    public String getTitle() { return title; } public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public Long getFulfilledByPostId() { return fulfilledByPostId; } public void setFulfilledByPostId(Long fulfilledByPostId) { this.fulfilledByPostId = fulfilledByPostId; }
    public Instant getCreatedAt() { return createdAt; } public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
