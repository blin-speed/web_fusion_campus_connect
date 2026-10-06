package com.campuscircular.backend.controller;

import com.campuscircular.backend.dto.AuthResponse;
import com.campuscircular.backend.dto.LoginRequest;
import com.campuscircular.backend.entity.User;
import com.campuscircular.backend.repository.UserRepository;
import com.campuscircular.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    @Value("${app.admin-password}")
    private String adminPassword;

    public AuthController(UserRepository userRepository, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/auth/login")
    public AuthResponse login(@RequestBody LoginRequest req) {
        if (req.userId() == null) throw new IllegalArgumentException("Missing userId");
        User user = userRepository.findById(req.userId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        String token = jwtUtils.generateToken(user.getId(), "user");
        return new AuthResponse(token, user);
    }

    @PostMapping("/auth/register")
    public AuthResponse register(@RequestBody Map<String, Object> req) {
        User user = new User();
        user.setName((String) req.get("name"));
        user.setDepartment((String) req.get("department"));
        user.setStudyYear((String) req.get("year"));
        user.setVerificationStatus("verified");
        user = userRepository.save(user);
        
        String token = jwtUtils.generateToken(user.getId(), "user");
        return new AuthResponse(token, user);
    }

    @PostMapping("/admin/login")
    public Map<String, String> adminLogin(@RequestBody Map<String, String> req) {
        if (!adminPassword.equals(req.get("password"))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin password");
        }
        String token = jwtUtils.generateToken(-1L, "admin");
        return Map.of("token", token);
    }
}
