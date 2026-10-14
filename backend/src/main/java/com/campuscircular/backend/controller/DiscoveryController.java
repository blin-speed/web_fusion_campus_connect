package com.campuscircular.backend.controller;

import com.campuscircular.backend.entity.NeedTemplate;
import com.campuscircular.backend.entity.Post;
import com.campuscircular.backend.repository.NeedTemplateRepository;
import com.campuscircular.backend.repository.PostRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/discover")
public class DiscoveryController {

    private final NeedTemplateRepository needTemplateRepository;
    private final PostRepository postRepository;

    public DiscoveryController(NeedTemplateRepository needTemplateRepository, PostRepository postRepository) {
        this.needTemplateRepository = needTemplateRepository;
        this.postRepository = postRepository;
    }

    @PostMapping("/need")
    public Object need(@RequestBody(required = false) Map<String, String> payload) {
        String query = payload != null && payload.get("query") != null ? payload.get("query").toLowerCase().trim() : "";

        List<NeedTemplate> templates = needTemplateRepository.findAll();
        List<String> interpretedNeeds = new ArrayList<>();

        for (NeedTemplate nt : templates) {
            String keywords = nt.getTriggerKeywords();
            if (keywords != null) {
                for (String kw : keywords.split(",")) {
                    if (!kw.trim().isEmpty() && query.contains(kw.trim().toLowerCase())) {
                        if (nt.getRequiredItemTypes() != null) {
                            for (String it : nt.getRequiredItemTypes().split(",")) {
                                if (!it.trim().isEmpty() && !interpretedNeeds.contains(it.trim())) {
                                    interpretedNeeds.add(it.trim());
                                }
                            }
                        }
                    }
                }
            }
        }

        List<String> finalInterpreted = interpretedNeeds.isEmpty()
                ? List.of("Camera / Mirrorless Body", "Tripod & Stabilization", "Wireless Microphone")
                : interpretedNeeds;

        List<Post> allPosts = postRepository.findAll();
        List<Post> recommendedPosts = allPosts.stream()
                .filter(p -> "available".equalsIgnoreCase(p.getAvailability()))
                .filter(p -> {
                    if (query.isEmpty()) return true;
                    String title = p.getTitle() != null ? p.getTitle().toLowerCase() : "";
                    String item = p.getItemName() != null ? p.getItemName().toLowerCase() : "";
                    String desc = p.getDescription() != null ? p.getDescription().toLowerCase() : "";
                    return title.contains(query) || item.contains(query) || desc.contains(query) ||
                           finalInterpreted.stream().anyMatch(need -> title.contains(need.toLowerCase()) || item.contains(need.toLowerCase()));
                })
                .toList();

        if (recommendedPosts.isEmpty()) {
            recommendedPosts = allPosts.stream().filter(p -> "available".equalsIgnoreCase(p.getAvailability())).toList();
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("interpretedNeeds", finalInterpreted);
        resp.put("recommendedPosts", recommendedPosts);
        resp.put("suggestedBundles", List.of());

        return resp;
    }

    @PostMapping("/compare")
    public Object compare() {
        return List.of();
    }
}
