package com.campuscircular.backend.controller;

import com.campuscircular.backend.entity.Category;
import com.campuscircular.backend.entity.Location;
import com.campuscircular.backend.entity.Post;
import com.campuscircular.backend.entity.User;
import com.campuscircular.backend.exception.ApiException;
import com.campuscircular.backend.repository.*;
import com.campuscircular.backend.security.AuthContext;
import com.campuscircular.backend.service.PricingService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final LocationRepository locationRepository;
    private final ExchangeRepository exchangeRepository;
    private final PricingService pricingService;
    private final Clock clock;

    public PostController(PostRepository postRepository,
                          UserRepository userRepository,
                          CategoryRepository categoryRepository,
                          LocationRepository locationRepository,
                          ExchangeRepository exchangeRepository,
                          PricingService pricingService,
                          Clock clock) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.locationRepository = locationRepository;
        this.exchangeRepository = exchangeRepository;
        this.pricingService = pricingService;
        this.clock = clock;
    }

    @GetMapping
    public List<Post> discover(@RequestParam(required = false) String q,
                               @RequestParam(required = false) String categoryId,
                               @RequestParam(required = false) String condition,
                               @RequestParam(required = false) String sort) {
        List<Post> posts = postRepository.findAll();

        if (q != null && !q.isBlank()) {
            String query = q.trim().toLowerCase();
            posts = posts.stream().filter(p ->
                    (p.getTitle() != null && p.getTitle().toLowerCase().contains(query)) ||
                    (p.getItemName() != null && p.getItemName().toLowerCase().contains(query)) ||
                    (p.getDescription() != null && p.getDescription().toLowerCase().contains(query)) ||
                    (p.getCategory() != null && p.getCategory().getName() != null && p.getCategory().getName().toLowerCase().contains(query))
            ).toList();
        }

        if (categoryId != null && !categoryId.isBlank()) {
            posts = posts.stream().filter(p ->
                    p.getCategory() != null && p.getCategory().getId() != null &&
                    p.getCategory().getId().toString().equals(categoryId.trim())
            ).toList();
        }

        if (condition != null && !condition.isBlank()) {
            posts = posts.stream().filter(p ->
                    p.getItemCondition() != null && condition.trim().equalsIgnoreCase(p.getItemCondition())
            ).toList();
        }

        posts = new ArrayList<>(posts);
        if ("price_asc".equals(sort)) {
            posts.sort(Comparator.comparing(p -> p.getRate() != null ? p.getRate() : BigDecimal.ZERO));
        } else if ("recent".equals(sort) || "id_desc".equals(sort)) {
            posts.sort((a, b) -> Long.compare(b.getId() != null ? b.getId() : 0L, a.getId() != null ? a.getId() : 0L));
        } else {
            posts.sort(Comparator.comparing(p -> p.getId() != null ? p.getId() : 0L));
        }

        return posts;
    }

    @GetMapping("/{id}")
    public Post detail(@PathVariable Long id) {
        return postRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public Post create(@RequestBody Map<String, Object> payload) {
        Long userId = AuthContext.getUserId();
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "User not found"));

        Category category = null;
        if (payload.get("categoryId") != null) {
            try {
                Long catId = Long.valueOf(payload.get("categoryId").toString());
                category = categoryRepository.findById(catId).orElse(null);
            } catch (Exception ignored) {}
        }
        if (category == null && payload.get("categoryName") != null) {
            String cName = payload.get("categoryName").toString().trim();
            if (!cName.isEmpty()) {
                Category newCat = new Category();
                newCat.setName(cName);
                category = categoryRepository.save(newCat);
            }
        }
        if (category == null) {
            category = categoryRepository.findById(1L).orElse(null);
        }
        if (category == null) {
            List<Category> allCats = categoryRepository.findAll();
            if (!allCats.isEmpty()) {
                category = allCats.get(0);
            } else {
                Category defaultCat = new Category();
                defaultCat.setName("General Hardware");
                category = categoryRepository.save(defaultCat);
            }
        }

        Location location = null;
        Object locParam = payload.get("locationId") != null ? payload.get("locationId") : payload.get("pickupLocationId");
        if (locParam != null) {
            try {
                Long locId = Long.valueOf(locParam.toString());
                location = locationRepository.findById(locId).orElse(null);
            } catch (Exception ignored) {}
        }
        if (location == null && payload.get("locationName") != null) {
            String lName = payload.get("locationName").toString().trim();
            if (!lName.isEmpty()) {
                Location newLoc = new Location();
                newLoc.setName(lName);
                newLoc.setLat(19.0645);
                newLoc.setLng(72.8358);
                location = locationRepository.save(newLoc);
            }
        }
        if (location == null) {
            location = owner.getLocation();
        }
        if (location == null) {
            location = locationRepository.findById(1L).orElse(null);
        }
        if (location == null) {
            List<Location> allLocs = locationRepository.findAll();
            if (!allLocs.isEmpty()) {
                location = allLocs.get(0);
            } else {
                Location defaultLoc = new Location();
                defaultLoc.setName("Campus Center");
                defaultLoc.setLat(19.0645);
                defaultLoc.setLng(72.8358);
                location = locationRepository.save(defaultLoc);
            }
        }

        String title = (String) payload.getOrDefault("title", "Campus Resource");
        String itemName = (String) payload.getOrDefault("itemName", payload.getOrDefault("title", "Item"));
        String description = (String) payload.getOrDefault("description", "Available for campus borrowing.");
        String itemCondition = ((String) payload.getOrDefault("itemCondition", "good")).toLowerCase();

        String accessories = "[]";
        Object accObj = payload.get("accessories");
        if (accObj != null) {
            String accStr = accObj.toString().trim();
            if (accStr.startsWith("[")) {
                accessories = accStr;
            } else if (!accStr.isBlank()) {
                String[] parts = accStr.split(",");
                List<String> items = new ArrayList<>();
                for (String p : parts) {
                    String trimmed = p.trim();
                    if (!trimmed.isEmpty()) {
                        items.add("\"" + trimmed.replace("\"", "\\\"") + "\"");
                    }
                }
                accessories = "[" + String.join(",", items) + "]";
            }
        }

        String rawRateUnit = (String) payload.get("rateUnit");
        String rateUnit = "HOUR".equalsIgnoreCase(rawRateUnit) ? "HOUR" : "DAY";

        BigDecimal rate = new BigDecimal(payload.getOrDefault("rate", "100").toString());
        BigDecimal minCharge = rate;
        BigDecimal securityDeposit = new BigDecimal(payload.getOrDefault("securityDeposit", "500").toString());

        BigDecimal lateFeePerUnit = payload.get("lateFeePerUnit") != null
                ? new BigDecimal(payload.get("lateFeePerUnit").toString())
                : rate;

        BigDecimal retailValue = payload.get("retailValue") != null
                ? new BigDecimal(payload.get("retailValue").toString())
                : securityDeposit.multiply(BigDecimal.valueOf(5));

        Post post = new Post();
        post.setOwner(owner);
        post.setCategory(category);
        post.setLocation(location);
        post.setTitle(title);
        post.setItemName(itemName);
        post.setDescription(description);
        post.setItemCondition(itemCondition);
        post.setAccessories(accessories);
        post.setRateUnit(rateUnit);
        post.setRate(rate);
        post.setMinCharge(minCharge);
        post.setSecurityDeposit(securityDeposit);
        post.setLateFeePerUnit(lateFeePerUnit);
        post.setMaxDurationUnits(7);
        post.setRetailValue(retailValue);
        post.setApprovalStatus("approved");
        post.setAvailability("available");
        post.setFlagged(false);
        post.setCreatedAt(Instant.now(clock));

        return postRepository.save(post);
    }

    @PutMapping("/{id}")
    public Post update(@PathVariable Long id, @RequestBody Post post) {
        Post existing = detail(id);
        if (!existing.getOwner().getId().equals(AuthContext.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        existing.setTitle(post.getTitle());
        return postRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void unlist(@PathVariable Long id) {
        Post existing = detail(id);
        if (!existing.getOwner().getId().equals(AuthContext.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        postRepository.delete(existing);
    }

    @GetMapping("/mine")
    public List<Post> mine() {
        return postRepository.findAll().stream()
                .filter(p -> p.getOwner() != null && p.getOwner().getId().equals(AuthContext.getUserId()))
                .toList();
    }

    @GetMapping("/{id}/quote")
    public Map<String, Object> quote(@PathVariable Long id,
                                     @RequestParam(required = false) String start,
                                     @RequestParam(required = false) String end) {
        Post p = detail(id);
        Instant now = Instant.now(clock);
        Instant startInstant = start != null ? parseFlexibleInstant(start, now.plusSeconds(3600)) : now.plusSeconds(3600);
        Instant endInstant = end != null ? parseFlexibleInstant(end, startInstant.plusSeconds(86400)) : startInstant.plusSeconds(86400);

        long units = pricingService.calculateUnits(startInstant, endInstant, p.getRateUnit());
        BigDecimal borrowingCharge = pricingService.calculateCharge(p.getRate(), units, p.getMinCharge());
        BigDecimal platformFee = pricingService.calculateFee(borrowingCharge, new BigDecimal("8.00"));
        BigDecimal transactionAmount = borrowingCharge.add(platformFee).add(p.getSecurityDeposit());

        Map<String, Object> agreement = new LinkedHashMap<>();
        agreement.put("resource", p.getTitle());
        agreement.put("owner", p.getOwner() != null ? p.getOwner().getName() : "");
        agreement.put("rateUnit", p.getRateUnit());
        agreement.put("units", units);
        agreement.put("lateFeePerUnit", p.getLateFeePerUnit());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("postId", p.getId());
        resp.put("units", units);
        resp.put("rate", p.getRate());
        resp.put("rateUnit", p.getRateUnit());
        resp.put("borrowingCharge", borrowingCharge);
        resp.put("platformFee", platformFee);
        resp.put("securityDeposit", p.getSecurityDeposit());
        resp.put("transactionAmount", transactionAmount);
        resp.put("lateFeePerUnit", p.getLateFeePerUnit());
        resp.put("agreement", agreement);

        return resp;
    }

    @GetMapping("/{id}/history")
    public List<?> history(@PathVariable Long id) {
        return exchangeRepository.findAll().stream()
                .filter(e -> e.getPost() != null && e.getPost().getId().equals(id))
                .toList();
    }

    public static Instant parseFlexibleInstant(String s, Instant fallback) {
        if (s == null || s.isBlank()) return fallback;
        String trimmed = s.trim();

        // Handle double-seconds or extra trailing :00 before Z (e.g. 2026-10-15T10:00:00:00Z)
        if (trimmed.endsWith(":00Z")) {
            trimmed = trimmed.substring(0, trimmed.length() - 4) + "Z";
        }

        try {
            return Instant.parse(trimmed);
        } catch (DateTimeParseException ignored) {}

        try {
            LocalDateTime ldt = LocalDateTime.parse(trimmed);
            return ldt.toInstant(ZoneOffset.UTC);
        } catch (DateTimeParseException ignored) {}

        try {
            LocalDateTime ldt = LocalDateTime.parse(trimmed, DateTimeFormatter.ISO_DATE_TIME);
            return ldt.toInstant(ZoneOffset.UTC);
        } catch (DateTimeParseException ignored) {}

        return fallback;
    }
}
