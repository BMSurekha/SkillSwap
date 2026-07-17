package com.skillswap.controller;

import com.skillswap.dto.RequestDto;
import com.skillswap.model.User;
import com.skillswap.repository.UserRepository;
import com.skillswap.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    @Autowired
    private RequestService requestService;

    @Autowired
    private UserRepository userRepository;

    private Long getAuthenticatedUserId(Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found!"));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<List<RequestDto>> getRequests(Principal principal) {
        Long userId = getAuthenticatedUserId(principal);
        List<RequestDto> requests = requestService.getRequestsForUser(userId);
        return ResponseEntity.ok(requests);
    }

    @PostMapping
    public ResponseEntity<?> createRequest(@RequestParam Long receiverId, Principal principal) {
        try {
            Long senderId = getAuthenticatedUserId(principal);
            RequestDto request = requestService.createRequest(senderId, receiverId);
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateRequestStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Principal principal) {
        try {
            Long userId = getAuthenticatedUserId(principal);
            RequestDto updated = requestService.updateRequestStatus(id, userId, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
