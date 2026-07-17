package com.skillswap.dto;

import java.util.List;

public class UserDto {
    private Long id;
    private String email;
    private String fullName;
    private String bio;
    private String location;
    private String avatarUrl;
    private String role;
    private Double averageRating;
    private Integer completedExchanges;
    private List<UserSkillDto> skillsOffered;
    private List<UserSkillDto> skillsWanted;

    public UserDto() {}

    public UserDto(Long id, String email, String fullName, String bio, String location, String avatarUrl, String role, Double averageRating, Integer completedExchanges, List<UserSkillDto> skillsOffered, List<UserSkillDto> skillsWanted) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.bio = bio;
        this.location = location;
        this.avatarUrl = avatarUrl;
        this.role = role;
        this.averageRating = averageRating;
        this.completedExchanges = completedExchanges;
        this.skillsOffered = skillsOffered;
        this.skillsWanted = skillsWanted;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Integer getCompletedExchanges() { return completedExchanges; }
    public void setCompletedExchanges(Integer completedExchanges) { this.completedExchanges = completedExchanges; }

    public List<UserSkillDto> getSkillsOffered() { return skillsOffered; }
    public void setSkillsOffered(List<UserSkillDto> skillsOffered) { this.skillsOffered = skillsOffered; }

    public List<UserSkillDto> getSkillsWanted() { return skillsWanted; }
    public void setSkillsWanted(List<UserSkillDto> skillsWanted) { this.skillsWanted = skillsWanted; }
}
