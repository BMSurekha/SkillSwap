package com.skillswap.service;

import com.skillswap.dto.RegisterRequest;
import com.skillswap.dto.UserDto;
import com.skillswap.dto.UserSkillDto;
import com.skillswap.model.*;
import com.skillswap.repository.SkillRepository;
import com.skillswap.repository.UserRepository;
import com.skillswap.repository.UserSkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already taken!");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setBio(request.getBio());
        user.setLocation(request.getLocation());
        user.setAvatarUrl(request.getAvatarUrl() != null ? request.getAvatarUrl() : 
                "https://api.dicebear.com/7.x/avataaars/svg?seed=" + request.getFullName().replaceAll(" ", ""));
        user.setRole(Role.USER);

        return userRepository.save(user);
    }

    public UserDto getUserDtoById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        return convertToDto(user);
    }

    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        return convertToDto(user);
    }

    public List<UserDto> searchUsers(String skillName, Long categoryId, String location, Long currentUserId) {
        List<User> allUsers = userRepository.findAll();
        List<UserDto> results = new ArrayList<>();

        for (User user : allUsers) {
            if (user.getRole() == Role.ADMIN) continue;
            if (currentUserId != null && user.getId().equals(currentUserId)) continue;
            
            List<UserSkill> skills = userSkillRepository.findByUserId(user.getId());
            boolean match = true;

            if (skillName != null && !skillName.trim().isEmpty()) {
                match = skills.stream().anyMatch(s -> s.getSkill().getName().toLowerCase().contains(skillName.toLowerCase()));
            }

            if (match && categoryId != null) {
                match = skills.stream().anyMatch(s -> s.getSkill().getCategory().getId().equals(categoryId));
            }

            if (match && location != null && !location.trim().isEmpty()) {
                match = user.getLocation() != null && user.getLocation().toLowerCase().contains(location.toLowerCase());
            }

            if (match) {
                results.add(convertToDto(user));
            }
        }
        return results;
    }

    @Transactional
    public UserDto updateUserProfile(Long userId, UserDto userDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        user.setFullName(userDto.getFullName());
        user.setBio(userDto.getBio());
        user.setLocation(userDto.getLocation());
        if (userDto.getAvatarUrl() != null) {
            user.setAvatarUrl(userDto.getAvatarUrl());
        }

        userRepository.save(user);
        return convertToDto(user);
    }

    @Transactional
    public void addSkill(Long userId, Long skillId, String experienceLevel, String type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found!"));

        // Check if skill already exists for user
        var existing = userSkillRepository.findByUserIdAndSkillIdAndType(userId, skillId, type);
        if (existing.isPresent()) {
            UserSkill userSkill = existing.get();
            userSkill.setExperienceLevel(ExperienceLevel.valueOf(experienceLevel.toUpperCase()));
            userSkillRepository.save(userSkill);
        } else {
            UserSkill userSkill = new UserSkill();
            userSkill.setUser(user);
            userSkill.setSkill(skill);
            userSkill.setExperienceLevel(ExperienceLevel.valueOf(experienceLevel.toUpperCase()));
            userSkill.setType(type.toUpperCase());
            userSkillRepository.save(userSkill);
        }
    }

    @Transactional
    public void removeSkill(Long userId, Long skillId, String type) {
        userSkillRepository.deleteByUserIdAndSkillIdAndType(userId, skillId, type.toUpperCase());
    }

    public UserDto convertToDto(User user) {
        List<UserSkill> skills = userSkillRepository.findByUserId(user.getId());
        
        List<UserSkillDto> offered = skills.stream()
                .filter(s -> s.getType().equals("TEACH"))
                .map(s -> new UserSkillDto(
                        s.getSkill().getId(),
                        s.getSkill().getName(),
                        s.getSkill().getCategory().getId(),
                        s.getSkill().getCategory().getName(),
                        s.getExperienceLevel().name()
                )).collect(Collectors.toList());

        List<UserSkillDto> wanted = skills.stream()
                .filter(s -> s.getType().equals("LEARN"))
                .map(s -> new UserSkillDto(
                        s.getSkill().getId(),
                        s.getSkill().getName(),
                        s.getSkill().getCategory().getId(),
                        s.getSkill().getCategory().getName(),
                        s.getExperienceLevel().name()
                )).collect(Collectors.toList());

        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getBio(),
                user.getLocation(),
                user.getAvatarUrl(),
                user.getRole().name(),
                user.getAverageRating(),
                user.getCompletedExchanges(),
                offered,
                wanted
        );
    }
}
