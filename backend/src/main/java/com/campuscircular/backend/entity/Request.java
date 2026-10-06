package com.campuscircular.backend.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name = "requests")
public class Request {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name = "post_id") private Post post;
    @ManyToOne @JoinColumn(name = "borrower_id") private User borrower;
    private String status;
    private Instant startAt;
    private Instant endAt;
    private Integer units;
    private String message;
    private String agreementSnapshot;
    private Instant createdAt;
    // Getters and Setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Post getPost() { return post; } public void setPost(Post post) { this.post = post; }
    public User getBorrower() { return borrower; } public void setBorrower(User borrower) { this.borrower = borrower; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public Instant getStartAt() { return startAt; } public void setStartAt(Instant startAt) { this.startAt = startAt; }
    public Instant getEndAt() { return endAt; } public void setEndAt(Instant endAt) { this.endAt = endAt; }
    public Integer getUnits() { return units; } public void setUnits(Integer units) { this.units = units; }
    public String getMessage() { return message; } public void setMessage(String message) { this.message = message; }
    public String getAgreementSnapshot() { return agreementSnapshot; } public void setAgreementSnapshot(String agreementSnapshot) { this.agreementSnapshot = agreementSnapshot; }
    public Instant getCreatedAt() { return createdAt; } public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
