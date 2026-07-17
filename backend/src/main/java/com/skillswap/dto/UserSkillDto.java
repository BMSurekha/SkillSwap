package com.skillswap.dto;

public class UserSkillDto {
    private Long skillId;
    private String name;
    private Long categoryId;
    private String categoryName;
    private String experienceLevel; // BEGINNER, INTERMEDIATE, ADVANCED

    public UserSkillDto() {}

    public UserSkillDto(Long skillId, String name, Long categoryId, String categoryName, String experienceLevel) {
        this.skillId = skillId;
        this.name = name;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.experienceLevel = experienceLevel;
    }

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
}
