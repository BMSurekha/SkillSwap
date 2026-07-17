package com.skillswap.dto;

import java.util.Map;

public class AnalyticsDto {
    private Long totalUsers;
    private Long activeUsers;
    private Long totalSkills;
    private Long totalExchanges;
    private Long pendingReports;
    private Map<String, Long> popularSkills;
    private Map<String, Long> categoryDistribution;
    private Map<String, Long> userRegistrationTrend;

    public AnalyticsDto() {}

    public AnalyticsDto(Long totalUsers, Long activeUsers, Long totalSkills, Long totalExchanges, Long pendingReports, Map<String, Long> popularSkills, Map<String, Long> categoryDistribution, Map<String, Long> userRegistrationTrend) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.totalSkills = totalSkills;
        this.totalExchanges = totalExchanges;
        this.pendingReports = pendingReports;
        this.popularSkills = popularSkills;
        this.categoryDistribution = categoryDistribution;
        this.userRegistrationTrend = userRegistrationTrend;
    }

    // Getters and Setters
    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }

    public Long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(Long activeUsers) { this.activeUsers = activeUsers; }

    public Long getTotalSkills() { return totalSkills; }
    public void setTotalSkills(Long totalSkills) { this.totalSkills = totalSkills; }

    public Long getTotalExchanges() { return totalExchanges; }
    public void setTotalExchanges(Long totalExchanges) { this.totalExchanges = totalExchanges; }

    public Long getPendingReports() { return pendingReports; }
    public void setPendingReports(Long pendingReports) { this.pendingReports = pendingReports; }

    public Map<String, Long> getPopularSkills() { return popularSkills; }
    public void setPopularSkills(Map<String, Long> popularSkills) { this.popularSkills = popularSkills; }

    public Map<String, Long> getCategoryDistribution() { return categoryDistribution; }
    public void setCategoryDistribution(Map<String, Long> categoryDistribution) { this.categoryDistribution = categoryDistribution; }

    public Map<String, Long> getUserRegistrationTrend() { return userRegistrationTrend; }
    public void setUserRegistrationTrend(Map<String, Long> userRegistrationTrend) { this.userRegistrationTrend = userRegistrationTrend; }
}
