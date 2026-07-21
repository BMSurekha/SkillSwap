package com.skillswap.controller;

import com.skillswap.dto.AuthRequest;
import com.skillswap.dto.AuthResponse;
import com.skillswap.dto.RegisterRequest;
import com.skillswap.model.User;
import com.skillswap.repository.UserRepository;
import com.skillswap.service.EmailService;
import com.skillswap.service.UserService;
import com.skillswap.util.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    // Helper record for storing OTP details
    private static class OtpData {
        String code;
        long expiryTime;

        OtpData(String code, long expiryTime) {
            this.code = code;
            this.expiryTime = expiryTime;
        }
    }

    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        try {
            User registered = userService.registerUser(request);
            return ResponseEntity.ok(Map.of("message", "User registered successfully!", "userId", registered.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
            );
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Incorrect email or password"));
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getEmail());
        final String jwt = jwtTokenUtil.generateToken(userDetails);
        User user = (User) userDetails;

        return ResponseEntity.ok(new AuthResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getAvatarUrl()
        ));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        if (!userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "No account registered with this email address."));
        }

        // Generate 6-digit OTP code
        String otpCode = String.format("%06d", new Random().nextInt(900000) + 100000);
        long expiry = System.currentTimeMillis() + (10 * 60 * 1000); // Valid 10 mins

        otpStorage.put(email.toLowerCase(), new OtpData(otpCode, expiry));

        // Dispatch Email
        boolean sent = emailService.sendOtpEmail(email, otpCode);

        return ResponseEntity.ok(Map.of(
                "message", "A 6-digit OTP code has been sent to " + email,
                "emailSent", sent
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP code are required"));
        }

        OtpData data = otpStorage.get(email.toLowerCase());
        if (data == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No OTP request found for this email. Please request a new code."));
        }

        if (System.currentTimeMillis() > data.expiryTime) {
            otpStorage.remove(email.toLowerCase());
            return ResponseEntity.badRequest().body(Map.of("error", "OTP code has expired. Please request a new code."));
        }

        if (!data.code.equals(otp.trim())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP code. Please check your email and try again."));
        }

        return ResponseEntity.ok(Map.of("message", "OTP verified successfully!"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (email == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and new password are required"));
        }

        // Validate OTP if provided
        if (otp != null && !otp.isBlank()) {
            OtpData data = otpStorage.get(email.toLowerCase());
            if (data == null || !data.code.equals(otp.trim())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP code"));
            }
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        otpStorage.remove(email.toLowerCase());

        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now login."));
    }
}
