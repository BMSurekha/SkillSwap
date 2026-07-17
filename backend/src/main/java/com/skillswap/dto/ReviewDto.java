package com.skillswap.dto;

import java.time.LocalDateTime;

public class ReviewDto {
    private Long id;
    private Long sessionId;
    private Long reviewerId;
    private String reviewerName;
    private String reviewerAvatar;
    private Long revieweeId;
    private Integer rating;
    private String reviewText;
    private LocalDateTime createdAt;

    public ReviewDto() {}

    public ReviewDto(Long id, Long sessionId, Long reviewerId, String reviewerName, String reviewerAvatar, Long revieweeId, Integer rating, String reviewText, LocalDateTime createdAt) {
        this.id = id;
        this.sessionId = sessionId;
        this.reviewerId = reviewerId;
        this.reviewerName = reviewerName;
        this.reviewerAvatar = reviewerAvatar;
        this.revieweeId = revieweeId;
        this.rating = rating;
        this.reviewText = reviewText;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public Long getReviewerId() { return reviewerId; }
    public void setReviewerId(Long reviewerId) { this.reviewerId = reviewerId; }

    public String getReviewerName() { return reviewerName; }
    public void setReviewerName(String reviewerName) { this.reviewerName = reviewerName; }

    public String getReviewerAvatar() { return reviewerAvatar; }
    public void setReviewerAvatar(String reviewerAvatar) { this.reviewerAvatar = reviewerAvatar; }

    public Long getRevieweeId() { return revieweeId; }
    public void setRevieweeId(Long revieweeId) { this.revieweeId = revieweeId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getReviewText() { return reviewText; }
    public void setReviewText(String reviewText) { this.reviewText = reviewText; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
