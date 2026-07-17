package com.skillswap.dto;

import java.util.List;

public class MatchResponse {
    private UserDto user;
    private Integer compatibilityPercentage;
    private List<String> mutualSkills;
    private List<String> mutualCategories;

    public MatchResponse() {}

    public MatchResponse(UserDto user, Integer compatibilityPercentage, List<String> mutualSkills, List<String> mutualCategories) {
        this.user = user;
        this.compatibilityPercentage = compatibilityPercentage;
        this.mutualSkills = mutualSkills;
        this.mutualCategories = mutualCategories;
    }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    public Integer getCompatibilityPercentage() { return compatibilityPercentage; }
    public void setCompatibilityPercentage(Integer compatibilityPercentage) { this.compatibilityPercentage = compatibilityPercentage; }

    public List<String> getMutualSkills() { return mutualSkills; }
    public void setMutualSkills(List<String> mutualSkills) { this.mutualSkills = mutualSkills; }

    public List<String> getMutualCategories() { return mutualCategories; }
    public void setMutualCategories(List<String> mutualCategories) { this.mutualCategories = mutualCategories; }
}
