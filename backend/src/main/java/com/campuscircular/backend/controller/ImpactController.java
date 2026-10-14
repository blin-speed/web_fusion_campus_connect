package com.campuscircular.backend.controller;

import com.campuscircular.backend.entity.Exchange;
import com.campuscircular.backend.entity.Post;
import com.campuscircular.backend.repository.ExchangeRepository;
import com.campuscircular.backend.repository.PostRepository;
import com.campuscircular.backend.repository.UserRepository;
import com.campuscircular.backend.service.TrustService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/impact")
public class ImpactController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ExchangeRepository exchangeRepository;
    private final TrustService trustService;

    public ImpactController(UserRepository userRepository,
                            PostRepository postRepository,
                            ExchangeRepository exchangeRepository,
                            TrustService trustService) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.exchangeRepository = exchangeRepository;
        this.trustService = trustService;
    }

    @GetMapping
    public Object stats() {
        long activeMembersCount = userRepository.count();
        List<Post> allPosts = postRepository.findAll();
        long resourcesSharedCount = allPosts.size();

        List<Exchange> allExchanges = exchangeRepository.findAll();
        List<Exchange> completed = allExchanges.stream()
                .filter(e -> "settled".equalsIgnoreCase(e.getState()) || "rated".equalsIgnoreCase(e.getState()))
                .toList();

        long successfulExchangesCount = completed.size();

        BigDecimal retailSum = completed.stream()
                .filter(e -> e.getPost() != null && e.getPost().getRetailValue() != null)
                .map(e -> e.getPost().getRetailValue())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal moneySaved = retailSum.multiply(new BigDecimal("0.25"));
        long resourcesReusedCount = successfulExchangesCount;

        String popularCategory = "No Activity Yet";
        long popularCategoryCount = 0;

        if (!allPosts.isEmpty()) {
            Map<String, Long> catCounts = allPosts.stream()
                    .filter(p -> p.getCategory() != null && p.getCategory().getName() != null)
                    .collect(Collectors.groupingBy(p -> p.getCategory().getName(), Collectors.counting()));
            if (!catCounts.isEmpty()) {
                Map.Entry<String, Long> top = catCounts.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .orElse(null);
                if (top != null) {
                    popularCategory = top.getKey();
                    popularCategoryCount = top.getValue();
                }
            }
        }

        Double avgTrustScore = 0.0;
        List<Exchange> ratedExchanges = allExchanges.stream()
                .filter(e -> e.getRating() != null && e.getRating() > 0)
                .toList();
        if (!ratedExchanges.isEmpty()) {
            avgTrustScore = ratedExchanges.stream()
                    .mapToInt(Exchange::getRating)
                    .average()
                    .orElse(0.0);
        }

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("activeMembersCount", activeMembersCount);
        map.put("resourcesSharedCount", resourcesSharedCount);
        map.put("successfulExchangesCount", successfulExchangesCount);
        map.put("popularCategory", popularCategory);
        map.put("popularCategoryCount", popularCategoryCount);
        map.put("moneySaved", moneySaved);
        map.put("resourcesReusedCount", resourcesReusedCount);
        map.put("avgTrustScore", avgTrustScore > 0 ? Math.round(avgTrustScore * 10.0) / 10.0 : null);

        return map;
    }
}
