package com.skillswap.controller;

import com.skillswap.dto.MatchResponse;
import com.skillswap.dto.UserDto;
import com.skillswap.model.Skill;
import com.skillswap.model.SkillCategory;
import com.skillswap.model.User;
import com.skillswap.repository.SkillCategoryRepository;
import com.skillswap.repository.SkillRepository;
import com.skillswap.repository.UserRepository;
import com.skillswap.service.MatchmakingService;
import com.skillswap.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private MatchmakingService matchmakingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private SkillCategoryRepository categoryRepository;

    private Long getAuthenticatedUserId(Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found!"));
        return user.getId();
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(Principal principal) {
        UserDto dto = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        UserDto dto = userService.getUserDtoById(id);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(@RequestBody UserDto dto, Principal principal) {
        Long userId = getAuthenticatedUserId(principal);
        UserDto updated = userService.updateUserProfile(userId, dto);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/skills")
    public ResponseEntity<?> addSkill(
            @RequestParam Long skillId,
            @RequestParam String experienceLevel,
            @RequestParam String type,
            Principal principal) {
        try {
            Long userId = getAuthenticatedUserId(principal);
            userService.addSkill(userId, skillId, experienceLevel, type);
            return ResponseEntity.ok(Map.of("message", "Skill added successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/skills")
    public ResponseEntity<?> removeSkill(
            @RequestParam Long skillId,
            @RequestParam String type,
            Principal principal) {
        try {
            Long userId = getAuthenticatedUserId(principal);
            userService.removeSkill(userId, skillId, type);
            return ResponseEntity.ok(Map.of("message", "Skill removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUsers(
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String location,
            Principal principal) {
        Long currentUserId = null;
        if (principal != null) {
            try {
                currentUserId = getAuthenticatedUserId(principal);
            } catch (Exception e) {
                // Ignore principal resolution error for non-authenticated public searches if any
            }
        }
        List<UserDto> results = userService.searchUsers(skill, categoryId, location, currentUserId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/matches")
    public ResponseEntity<List<MatchResponse>> getMatches(Principal principal) {
        Long userId = getAuthenticatedUserId(principal);
        List<MatchResponse> matches = matchmakingService.getMatchesForUser(userId);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/skills/list")
    public ResponseEntity<List<Skill>> getSkillsList() {
        return ResponseEntity.ok(skillRepository.findAll());
    }

    @GetMapping("/categories/list")
    public ResponseEntity<List<SkillCategory>> getCategoriesList() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }
}
