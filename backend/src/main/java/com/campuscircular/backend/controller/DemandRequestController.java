package com.campuscircular.backend.controller;

import com.campuscircular.backend.entity.Category;
import com.campuscircular.backend.entity.DemandRequest;
import com.campuscircular.backend.entity.User;
import com.campuscircular.backend.exception.ApiException;
import com.campuscircular.backend.repository.CategoryRepository;
import com.campuscircular.backend.repository.DemandRequestRepository;
import com.campuscircular.backend.repository.UserRepository;
import com.campuscircular.backend.security.AuthContext;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Clock;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/demand-requests")
public class DemandRequestController {

    private final DemandRequestRepository demandRequestRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final Clock clock;

    public DemandRequestController(DemandRequestRepository demandRequestRepository,
                                   UserRepository userRepository,
                                   CategoryRepository categoryRepository,
                                   Clock clock) {
        this.demandRequestRepository = demandRequestRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.clock = clock;
    }

    private Map<String, Object> toMap(DemandRequest dr) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", dr.getId());
        map.put("title", dr.getTitle());
        map.put("description", dr.getDescription());
        map.put("status", dr.getStatus());
        map.put("fulfilledByPostId", dr.getFulfilledByPostId());
        map.put("createdAt", dr.getCreatedAt());
        map.put("requesterId", dr.getRequester() != null ? dr.getRequester().getId() : null);
        map.put("requesterName", dr.getRequester() != null ? dr.getRequester().getName() : "Anonymous");
        map.put("channel", dr.getCategory() != null ? dr.getCategory().getName() : "General");
        return map;
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return demandRequestRepository.findAll().stream().map(this::toMap).toList();
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody Map<String, Object> payload) {
        Long userId = AuthContext.getUserId();
        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "User not found"));

        DemandRequest dr = new DemandRequest();
        dr.setRequester(requester);
        dr.setTitle((String) payload.getOrDefault("title", "Need Resource"));
        dr.setDescription((String) payload.getOrDefault("description", "Looking for equipment"));
        dr.setStatus("open");
        dr.setCreatedAt(Instant.now(clock));

        if (payload.get("categoryId") != null) {
            try {
                Long catId = Long.valueOf(payload.get("categoryId").toString());
                Category cat = categoryRepository.findById(catId).orElse(null);
                dr.setCategory(cat);
            } catch (Exception ignored) {}
        }

        DemandRequest saved = demandRequestRepository.save(dr);
        return toMap(saved);
    }

    @PostMapping("/{id}/fulfill")
    public Map<String, Object> fulfill(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> payload) {
        DemandRequest dr = demandRequestRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Demand request not found"));

        dr.setStatus("fulfilled");
        if (payload != null && payload.get("postId") != null) {
            try {
                dr.setFulfilledByPostId(Long.valueOf(payload.get("postId").toString()));
            } catch (Exception ignored) {}
        }
        DemandRequest saved = demandRequestRepository.save(dr);
        return toMap(saved);
    }
}
