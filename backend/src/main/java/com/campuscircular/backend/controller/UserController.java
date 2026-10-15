package com.campuscircular.backend.controller;

import com.campuscircular.backend.entity.Location;
import com.campuscircular.backend.entity.User;
import com.campuscircular.backend.exception.ApiException;
import com.campuscircular.backend.repository.LocationRepository;
import com.campuscircular.backend.repository.UserRepository;
import com.campuscircular.backend.security.AuthContext;
import com.campuscircular.backend.service.TrustService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final TrustService trustService;

    public UserController(UserRepository userRepository,
                          LocationRepository locationRepository,
                          TrustService trustService) {
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.trustService = trustService;
    }

    public Map<String, Object> enrichUser(User u) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", u.getId());
        map.put("name", u.getName());
        map.put("department", u.getDepartment());
        map.put("studyYear", u.getStudyYear());
        map.put("year", u.getStudyYear());
        map.put("suspendedReason", u.getSuspendedReason());
        map.put("location", u.getLocation());
        map.put("bio", u.getBio());
        map.put("createdAt", u.getCreatedAt());

        Map<String, Object> trustStats = trustService.getUserTrustStats(u.getId());
        boolean isVerified = Boolean.TRUE.equals(trustStats.get("isVerified"));

        map.put("verificationStatus", isVerified ? "verified" : "pending");
        map.put("status", u.getSuspendedReason() != null ? "SUSPENDED" : (isVerified ? "VERIFIED" : "ACTIVE"));
        map.putAll(trustStats);
        map.put("isVerified", isVerified);
        map.put("verified", isVerified);
        return map;
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return userRepository.findAll().stream().map(this::enrichUser).toList();
    }

    @GetMapping("/{id}")
    public Map<String, Object> profile(@PathVariable Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "User not found"));
        return enrichUser(u);
    }

    @PatchMapping("/me")
    public Map<String, Object> updateProfile(@RequestBody Map<String, Object> body) {
        Long currentUserId = AuthContext.getUserId();
        User u = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "User not found"));

        if (body.containsKey("department")) {
            u.setDepartment((String) body.get("department"));
        }
        if (body.containsKey("studyYear") || body.containsKey("year")) {
            Object yr = body.containsKey("studyYear") ? body.get("studyYear") : body.get("year");
            if (yr != null) {
                try {
                    String s = yr.toString().replaceAll("\\D", "");
                    if (!s.isEmpty()) {
                        u.setStudyYear(Integer.parseInt(s));
                    }
                } catch (Exception ignored) {}
            }
        }
        if (body.containsKey("bio")) {
            u.setBio((String) body.get("bio"));
        }
        if (body.containsKey("locationId") && body.get("locationId") != null) {
            Long locId = Long.valueOf(body.get("locationId").toString());
            Location loc = locationRepository.findById(locId).orElse(null);
            if (loc != null) {
                u.setLocation(loc);
            }
        }

        userRepository.save(u);
        return enrichUser(u);
    }
}
