package com.skillswap.dto;

public class RegisterRequest {
    private String email;
    private String password;
    private String fullName;
    private String bio;
    private String location;
    private String avatarUrl;

    public RegisterRequest() {}

    public RegisterRequest(String email, String password, String fullName, String bio, String location, String avatarUrl) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.bio = bio;
        this.location = location;
        this.avatarUrl = avatarUrl;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
