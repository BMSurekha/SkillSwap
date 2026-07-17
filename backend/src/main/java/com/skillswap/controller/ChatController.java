package com.skillswap.controller;

import com.skillswap.dto.MessageDto;
import com.skillswap.dto.UserDto;
import com.skillswap.model.User;
import com.skillswap.repository.UserRepository;
import com.skillswap.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserRepository userRepository;

    private Long getAuthenticatedUserId(Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found!"));
        return user.getId();
    }

    @GetMapping("/history/{partnerId}")
    public ResponseEntity<List<MessageDto>> getChatHistory(@PathVariable Long partnerId, Principal principal) {
        Long userId = getAuthenticatedUserId(principal);
        List<MessageDto> history = chatService.getChatHistory(userId, partnerId);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/send/{partnerId}")
    public ResponseEntity<?> sendMessage(
            @PathVariable Long partnerId,
            @RequestBody MessageDto messageDto,
            Principal principal) {
        try {
            Long senderId = getAuthenticatedUserId(principal);
            MessageDto saved = chatService.sendMessage(senderId, partnerId, messageDto);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<UserDto>> getContacts(Principal principal) {
        Long userId = getAuthenticatedUserId(principal);
        List<UserDto> contacts = chatService.getChatContacts(userId);
        return ResponseEntity.ok(contacts);
    }
}
