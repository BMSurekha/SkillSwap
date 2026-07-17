package com.skillswap.service;

import com.skillswap.dto.AnalyticsDto;
import com.skillswap.model.ExchangeRequest;
import com.skillswap.model.Role;
import com.skillswap.model.User;
import com.skillswap.model.UserSkill;
import com.skillswap.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.TextStyle;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private ExchangeRequestRepository requestRepository;

    public AnalyticsDto getPlatformStatistics() {
        long totalUsers = userRepository.count();
        
        // Active users are users with role USER who have completed at least one exchange or have skills registered
        long activeUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.USER && (u.getCompletedExchanges() > 0 || !userSkillRepository.findByUserId(u.getId()).isEmpty()))
                .count();

        long totalSkills = skillRepository.count();
        long totalExchanges = requestRepository.count(); // All proposals / matches
        long pendingReports = 0; // Simulated reports count

        // Calculate popular skills (skills most taught/learned)
        Map<String, Long> popularSkills = new HashMap<>();
        List<UserSkill> userSkills = userSkillRepository.findAll();
        for (UserSkill us : userSkills) {
            String skillName = us.getSkill().getName();
            popularSkills.put(skillName, popularSkills.getOrDefault(skillName, 0L) + 1);
        }
        
        // Sort and limit popular skills to top 5
        Map<String, Long> topPopularSkills = popularSkills.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        // Category distribution
        Map<String, Long> categoryDistribution = new HashMap<>();
        for (UserSkill us : userSkills) {
            String categoryName = us.getSkill().getCategory().getName();
            categoryDistribution.put(categoryName, categoryDistribution.getOrDefault(categoryName, 0L) + 1);
        }

        // Registration trends (Simulated based on creation date of current users)
        Map<String, Long> registrationTrend = new HashMap<>();
        List<User> users = userRepository.findAll();
        for (User u : users) {
            if (u.getCreatedAt() != null) {
                String month = u.getCreatedAt().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                registrationTrend.put(month, registrationTrend.getOrDefault(month, 0L) + 1);
            } else {
                registrationTrend.put("Jul", registrationTrend.getOrDefault("Jul", 0L) + 1);
            }
        }

        return new AnalyticsDto(
                totalUsers,
                activeUsers,
                totalSkills,
                totalExchanges,
                pendingReports,
                topPopularSkills,
                categoryDistribution,
                registrationTrend
        );
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void removeUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Cannot delete system administrator!");
        }
        userRepository.delete(user);
    }
}
