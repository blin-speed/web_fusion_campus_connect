package com.campuscircular.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/discover")
public class DiscoveryController {

    @PostMapping("/need")
    public Object need(@RequestBody Map<String, String> payload) {
        String query = payload.get("query");
        // Mocking the rule engine response
        return Map.of(
            "interpretedNeeds", List.of(
                Map.of("category", "Filming Equipment", "items", List.of("camera", "tripod"))
            ),
            "suggestedBundles", List.of()
        );
    }

    @PostMapping("/compare")
    public Object compare() {
        return List.of();
    }
}
