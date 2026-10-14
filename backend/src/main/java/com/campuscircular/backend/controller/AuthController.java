package com.campuscircular.backend.controller;

import com.campuscircular.backend.dto.AuthResponse;
import com.campuscircular.backend.entity.Location;
import com.campuscircular.backend.entity.Setting;
import com.campuscircular.backend.entity.User;
import com.campuscircular.backend.exception.ApiException;
import com.campuscircular.backend.repository.LocationRepository;
import com.campuscircular.backend.repository.SettingRepository;
import com.campuscircular.backend.repository.UserRepository;
import com.campuscircular.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class AuthController {

    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final SettingRepository settingRepository;
    private final JwtUtils jwtUtils;

    @Value("${app.admin-password}")
    private String adminPassword;

    public AuthController(UserRepository userRepository,
                          LocationRepository locationRepository,
                          SettingRepository settingRepository,
                          JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.settingRepository = settingRepository;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/auth/login")
    public AuthResponse login(@RequestBody Map<String, Object> req) {
        User user = null;

        // Backward compatibility for smoke.sh or ID-based login
        if (req.get("userId") != null) {
            try {
                Long uid = Long.valueOf(req.get("userId").toString());
                user = userRepository.findById(uid)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            } catch (NumberFormatException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid userId");
            }
        } else {
            String username = req.get("username") != null ? req.get("username").toString().trim()
                    : req.get("name") != null ? req.get("name").toString().trim() : null;

            if (username == null || username.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing username or userId");
            }

            final String lookupName = username;
            user = userRepository.findAll().stream()
                    .filter(u -> u.getName() != null && u.getName().equalsIgnoreCase(lookupName))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

            String password = req.get("password") != null ? req.get("password").toString() : "";
            String pwdKey = "pwd_user_" + user.getId();
            Setting pwdSetting = settingRepository.findById(pwdKey).orElse(null);

            if (pwdSetting != null) {
                if (!pwdSetting.getValue().equals(password)) {
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
                }
            } else {
                // If seeded user doesn't have an explicit password yet, set it or accept standard defaults
                if (password.length() < 4 && !password.equals("password") && !password.equals("campus123")) {
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Password must be at least 4 characters");
                }
                Setting newSetting = new Setting();
                newSetting.setKey(pwdKey);
                newSetting.setValue(password.isEmpty() ? "password" : password);
                settingRepository.save(newSetting);
            }
        }

        String token = jwtUtils.generateToken(user.getId(), "user");
        return new AuthResponse(token, user);
    }

    @PostMapping("/auth/register")
    public AuthResponse register(@RequestBody Map<String, Object> req) {
        String name = req.get("name") != null ? req.get("name").toString().trim()
                : req.get("username") != null ? req.get("username").toString().trim() : null;

        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }

        final String finalName = name;
        boolean exists = userRepository.findAll().stream()
                .anyMatch(u -> u.getName() != null && u.getName().equalsIgnoreCase(finalName));
        if (exists) {
            throw new ApiException(HttpStatus.CONFLICT, "USER_EXISTS", "User already exists with this name");
        }

        String password = req.get("password") != null ? req.get("password").toString() : "campus123";
        if (password.length() < 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 4 characters");
        }

        User user = new User();
        user.setName(name);
        user.setDepartment(req.get("department") != null ? req.get("department").toString() : "Engineering");
        user.setStudyYear(req.get("year") != null ? req.get("year").toString()
                : req.get("studyYear") != null ? req.get("studyYear").toString() : "1st Year");
        user.setVerificationStatus("verified");
        user.setBio(req.get("bio") != null ? req.get("bio").toString() : "Campus member");
        user.setCreatedAt(Instant.now());

        if (req.get("locationId") != null) {
            try {
                Long locId = Long.valueOf(req.get("locationId").toString());
                Location loc = locationRepository.findById(locId).orElse(null);
                user.setLocation(loc);
            } catch (Exception ignored) {}
        }
        if (user.getLocation() == null) {
            user.setLocation(locationRepository.findById(1L).orElse(null));
        }

        user = userRepository.save(user);

        // Store password in SettingRepository
        Setting pwdSetting = new Setting();
        pwdSetting.setKey("pwd_user_" + user.getId());
        pwdSetting.setValue(password);
        settingRepository.save(pwdSetting);

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
