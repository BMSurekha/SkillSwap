package com.skillswap.controller;

import com.skillswap.dto.AnalyticsDto;
import com.skillswap.model.User;
import com.skillswap.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsDto> getAnalytics() {
        AnalyticsDto dto = adminService.getPlatformStatistics();
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> removeUser(@PathVariable Long id) {
        try {
            adminService.removeUser(id);
            return ResponseEntity.ok(Map.of("message", "User account removed successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
