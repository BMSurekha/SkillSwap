package com.skillswap.service;

import com.skillswap.dto.MatchResponse;
import com.skillswap.dto.UserDto;
import com.skillswap.dto.UserSkillDto;
import com.skillswap.model.User;
import com.skillswap.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MatchmakingService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    public List<MatchResponse> getMatchesForUser(Long userId) {
        UserDto currentUser = userService.getUserDtoById(userId);
        List<User> allUsers = userRepository.findAll();
        List<MatchResponse> matches = new ArrayList<>();

        for (User user : allUsers) {
            if (user.getId().equals(userId) || user.getRole().name().equals("ADMIN")) {
                continue;
            }

            UserDto targetUser = userService.convertToDto(user);
            MatchResponse match = calculateCompatibility(currentUser, targetUser);

            if (match.getCompatibilityPercentage() > 0) {
                matches.add(match);
            }
        }

        // Sort by compatibility percentage descending
        matches.sort((m1, m2) -> m2.getCompatibilityPercentage().compareTo(m1.getCompatibilityPercentage()));
        return matches;
    }

    private MatchResponse calculateCompatibility(UserDto userA, UserDto userB) {
        int score = 0;
        List<String> mutualSkills = new ArrayList<>();
        List<String> mutualCategories = new ArrayList<>();

        // 1. Skill alignment (50% max)
        boolean aTeachesB = false;
        boolean bTeachesA = false;

        // User A offers, User B wants
        for (UserSkillDto offerA : userA.getSkillsOffered()) {
            for (UserSkillDto wantB : userB.getSkillsWanted()) {
                if (offerA.getSkillId().equals(wantB.getSkillId())) {
                    aTeachesB = true;
                    mutualSkills.add(offerA.getName() + " (A -> B)");
                }
            }
        }

        // User B offers, User A wants
        for (UserSkillDto offerB : userB.getSkillsOffered()) {
            for (UserSkillDto wantA : userA.getSkillsWanted()) {
                if (offerB.getSkillId().equals(wantA.getSkillId())) {
                    bTeachesA = true;
                    mutualSkills.add(offerB.getName() + " (B -> A)");
                }
            }
        }

        if (aTeachesB && bTeachesA) {
            score += 50; // Perfect mutual swap match
        } else if (aTeachesB || bTeachesA) {
            score += 25; // One way teach match
        }

        // 2. Common Categories (15% max)
        var categoriesA = userA.getSkillsOffered().stream().map(UserSkillDto::getCategoryName).collect(Collectors.toSet());
        categoriesA.addAll(userA.getSkillsWanted().stream().map(UserSkillDto::getCategoryName).collect(Collectors.toSet()));

        var categoriesB = userB.getSkillsOffered().stream().map(UserSkillDto::getCategoryName).collect(Collectors.toSet());
        categoriesB.addAll(userB.getSkillsWanted().stream().map(UserSkillDto::getCategoryName).collect(Collectors.toSet()));

        int commonCatsCount = 0;
        for (String catA : categoriesA) {
            if (categoriesB.contains(catA)) {
                commonCatsCount++;
                mutualCategories.add(catA);
            }
        }
        score += Math.min(commonCatsCount * 5, 15);

        // 3. User Rating (15% max)
        if (userB.getAverageRating() != null) {
            score += (int) ((userB.getAverageRating() / 5.0) * 15);
        }

        // 4. Experience/Completed Exchanges (20% max)
        if (userB.getCompletedExchanges() != null) {
            score += Math.min(userB.getCompletedExchanges() * 2, 20);
        }

        return new MatchResponse(userB, Math.min(score, 100), mutualSkills, mutualCategories);
    }
}
