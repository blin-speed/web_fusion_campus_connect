package com.campuscircular.backend.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String name;
    private String department;
    private String studyYear;
    private String verificationStatus;
    private String suspendedReason;
    @ManyToOne @JoinColumn(name = "location_id") private Location location;
    private String bio;
    private Instant createdAt;
    // Getters and setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getDepartment() { return department; } public void setDepartment(String department) { this.department = department; }
    public String getStudyYear() { return studyYear; } public void setStudyYear(String studyYear) { this.studyYear = studyYear; }
    public String getVerificationStatus() { return verificationStatus; } public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
    public String getSuspendedReason() { return suspendedReason; } public void setSuspendedReason(String suspendedReason) { this.suspendedReason = suspendedReason; }
    public Location getLocation() { return location; } public void setLocation(Location location) { this.location = location; }
    public String getBio() { return bio; } public void setBio(String bio) { this.bio = bio; }
    public Instant getCreatedAt() { return createdAt; } public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
