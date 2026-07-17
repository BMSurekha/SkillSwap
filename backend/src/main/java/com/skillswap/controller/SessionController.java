package com.skillswap.controller;

import com.skillswap.dto.ReviewDto;
import com.skillswap.dto.SessionDto;
import com.skillswap.model.User;
import com.skillswap.repository.UserRepository;
import com.skillswap.service.ReviewService;
import com.skillswap.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    @Autowired
    private SessionService sessionService;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserRepository userRepository;

    private Long getAuthenticatedUserId(Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found!"));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<List<SessionDto>> getSessions(Principal principal) {
        Long userId = getAuthenticatedUserId(principal);
        List<SessionDto> sessions = sessionService.getSessionsForUser(userId);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<SessionDto>> getUpcomingSessions(Principal principal) {
        Long userId = getAuthenticatedUserId(principal);
        List<SessionDto> sessions = sessionService.getUpcomingSessionsForUser(userId);
        return ResponseEntity.ok(sessions);
    }

    @PostMapping
    public ResponseEntity<?> scheduleSession(
            @RequestParam Long requestId,
            @RequestBody SessionDto sessionDto,
            Principal principal) {
        try {
            Long userId = getAuthenticatedUserId(principal);
            SessionDto scheduled = sessionService.scheduleSession(requestId, sessionDto, userId);
            return ResponseEntity.ok(scheduled);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeSession(@PathVariable Long id, Principal principal) {
        try {
            Long userId = getAuthenticatedUserId(principal);
            SessionDto completed = sessionService.completeSession(id, userId);
            return ResponseEntity.ok(completed);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelSession(@PathVariable Long id, Principal principal) {
        try {
            Long userId = getAuthenticatedUserId(principal);
            SessionDto cancelled = sessionService.cancelSession(id, userId);
            return ResponseEntity.ok(cancelled);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<?> submitReview(
            @PathVariable Long id,
            @RequestBody ReviewDto reviewDto,
            Principal principal) {
        try {
            Long reviewerId = getAuthenticatedUserId(principal);
            ReviewDto review = reviewService.addReview(id, reviewDto, reviewerId);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<ReviewDto>> getReviewsForUser(@PathVariable Long id) {
        List<ReviewDto> reviews = reviewService.getReviewsForUser(id);
        return ResponseEntity.ok(reviews);
    }
}
