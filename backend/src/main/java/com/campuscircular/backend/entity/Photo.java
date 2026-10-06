package com.campuscircular.backend.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name = "photos")
public class Photo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name = "uploader_id") private User uploader;
    private String purpose;
    private Long postId;
    private Long exchangeId;
    private Long disputeId;
    private String storedName;
    private String mime;
    private Integer sizeBytes;
    private Instant createdAt;
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public User getUploader() { return uploader; } public void setUploader(User uploader) { this.uploader = uploader; }
    public String getPurpose() { return purpose; } public void setPurpose(String purpose) { this.purpose = purpose; }
    public Long getPostId() { return postId; } public void setPostId(Long postId) { this.postId = postId; }
    public Long getExchangeId() { return exchangeId; } public void setExchangeId(Long exchangeId) { this.exchangeId = exchangeId; }
    public Long getDisputeId() { return disputeId; } public void setDisputeId(Long disputeId) { this.disputeId = disputeId; }
    public String getStoredName() { return storedName; } public void setStoredName(String storedName) { this.storedName = storedName; }
    public String getMime() { return mime; } public void setMime(String mime) { this.mime = mime; }
    public Integer getSizeBytes() { return sizeBytes; } public void setSizeBytes(Integer sizeBytes) { this.sizeBytes = sizeBytes; }
    public Instant getCreatedAt() { return createdAt; } public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
