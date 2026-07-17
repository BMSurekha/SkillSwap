package com.skillswap.dto;

import java.time.LocalDateTime;

public class SessionDto {
    private Long id;
    private Long requestId;
    private String title;
    private String description;
    private LocalDateTime dateTime;
    private Integer durationMinutes;
    private String meetingMode;
    private String meetingLink;
    private String location;
    private String status;
    private String partnerName;
    private String partnerAvatar;
    private Long partnerId;

    public SessionDto() {}

    public SessionDto(Long id, Long requestId, String title, String description, LocalDateTime dateTime, Integer durationMinutes, String meetingMode, String meetingLink, String location, String status, String partnerName, String partnerAvatar, Long partnerId) {
        this.id = id;
        this.requestId = requestId;
        this.title = title;
        this.description = description;
        this.dateTime = dateTime;
        this.durationMinutes = durationMinutes;
        this.meetingMode = meetingMode;
        this.meetingLink = meetingLink;
        this.location = location;
        this.status = status;
        this.partnerName = partnerName;
        this.partnerAvatar = partnerAvatar;
        this.partnerId = partnerId;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getMeetingMode() { return meetingMode; }
    public void setMeetingMode(String meetingMode) { this.meetingMode = meetingMode; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPartnerName() { return partnerName; }
    public void setPartnerName(String partnerName) { this.partnerName = partnerName; }

    public String getPartnerAvatar() { return partnerAvatar; }
    public void setPartnerAvatar(String partnerAvatar) { this.partnerAvatar = partnerAvatar; }

    public Long getPartnerId() { return partnerId; }
    public void setPartnerId(Long partnerId) { this.partnerId = partnerId; }
}
