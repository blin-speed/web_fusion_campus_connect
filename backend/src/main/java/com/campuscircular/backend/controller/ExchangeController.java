package com.campuscircular.backend.controller;

import com.campuscircular.backend.entity.Exchange;
import com.campuscircular.backend.repository.ExchangeRepository;
import com.campuscircular.backend.repository.TransactionRepository;
import com.campuscircular.backend.security.AuthContext;
import com.campuscircular.backend.service.ExchangeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/exchanges")
public class ExchangeController {

    private final ExchangeService exchangeService;
    private final ExchangeRepository exchangeRepository;
    private final TransactionRepository transactionRepository;
    private final com.campuscircular.backend.repository.PhotoRepository photoRepository;
    private final ObjectMapper objectMapper;
    private final PostController postController;

    public ExchangeController(ExchangeService exchangeService,
                              ExchangeRepository exchangeRepository,
                              TransactionRepository transactionRepository,
                              com.campuscircular.backend.repository.PhotoRepository photoRepository,
                              @org.springframework.beans.factory.annotation.Autowired(required = false) ObjectMapper objectMapper,
                              PostController postController) {
        this.exchangeService = exchangeService;
        this.exchangeRepository = exchangeRepository;
        this.transactionRepository = transactionRepository;
        this.photoRepository = photoRepository;
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
        this.postController = postController;
    }

    private void linkPhotos(Long exchangeId, Object rawPhotoIds, String purpose) {
        if (rawPhotoIds instanceof List<?> list) {
            for (Object pid : list) {
                try {
                    Long id = Long.valueOf(pid.toString());
                    photoRepository.findById(id).ifPresent(p -> {
                        p.setExchangeId(exchangeId);
                        if (purpose != null) p.setPurpose(purpose);
                        photoRepository.save(p);
                    });
                } catch (Exception ignored) {}
            }
        }
    }

    private String extractJson(Object raw) {
        if (raw == null) return "{\"notes\":\"OK\"}";
        if (raw instanceof String s) {
            String trimmed = s.trim();
            if (trimmed.isEmpty()) return "{\"notes\":\"OK\"}";
            return trimmed;
        }
        try {
            return objectMapper.writeValueAsString(raw);
        } catch (Exception e) {
            return "{\"notes\":\"OK\"}";
        }
    }

    @GetMapping("/mine")
    public List<Exchange> mine(@RequestParam(required = false) String role) {
        List<Exchange> list = exchangeRepository.findAll().stream().filter(e -> {
            if ("owner".equals(role)) return e.getOwner() != null && e.getOwner().getId().equals(AuthContext.getUserId());
            if ("borrower".equals(role)) return e.getBorrower() != null && e.getBorrower().getId().equals(AuthContext.getUserId());
            return (e.getOwner() != null && e.getOwner().getId().equals(AuthContext.getUserId())) ||
                   (e.getBorrower() != null && e.getBorrower().getId().equals(AuthContext.getUserId()));
        }).toList();
        list.forEach(e -> postController.attachPhotos(e.getPost()));
        return list;
    }

    @GetMapping("/{id}")
    public Exchange detail(@PathVariable Long id) {
        Exchange ex = exchangeRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        postController.attachPhotos(ex.getPost());
        return ex;
    }

    @PatchMapping("/{id}/locations")
    public void locations(@PathVariable Long id, @RequestBody Map<String, Long> payload) {}

    @PostMapping("/{id}/pay")
    public void pay(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> payload) {
        Long dropoffLocId = null;
        if (payload != null && payload.get("dropoffLocationId") != null) {
            try {
                dropoffLocId = Long.valueOf(payload.get("dropoffLocationId").toString());
            } catch (Exception ignored) {}
        }
        exchangeService.pay(id, dropoffLocId);
    }

    @PostMapping("/{id}/handover")
    public void handover(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        linkPhotos(id, payload.get("photoIds"), "CONDITION_BEFORE");
        exchangeService.handover(id, extractJson(payload.get("conditionBefore")));
    }

    @PostMapping("/{id}/return")
    public void returnItem(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        linkPhotos(id, payload.get("photoIds"), "CONDITION_AFTER");
        String notes = payload.get("notes") != null ? payload.get("notes").toString() : "";
        String condAfter = payload.get("conditionAfter") != null ? extractJson(payload.get("conditionAfter")) : extractJson(payload);
        exchangeService.returnItem(id, notes, condAfter);
    }

    @PostMapping("/{id}/inspect")
    public void inspect(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        linkPhotos(id, payload.get("photoIds"), "CONDITION_AFTER");
        BigDecimal dmg = null;
        String damageNotes = null;
        if (payload.containsKey("damage") && payload.get("damage") != null) {
            Map<String, Object> damage = (Map<String, Object>) payload.get("damage");
            if (damage.containsKey("amount")) {
                dmg = new BigDecimal(damage.get("amount").toString());
            }
            if (damage.containsKey("notes")) {
                damageNotes = damage.get("notes") != null ? damage.get("notes").toString() : null;
            }
        }
        exchangeService.inspect(id, extractJson(payload.get("conditionAfter")), dmg, damageNotes);
    }

    @PostMapping("/{id}/damage/accept")
    public void damageAccept(@PathVariable Long id) {
        exchangeService.damageAccept(id);
    }

    @PostMapping("/{id}/damage/contest")
    public void damageContest(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> payload) {
        exchangeService.damageContest(id, payload);
    }

    @PostMapping("/{id}/rate")
    public void rate(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        if (payload == null || payload.get("rating") == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating between 1 and 5 is required");
        }
        int rating;
        try {
            rating = Integer.parseInt(payload.get("rating").toString());
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be a valid integer between 1 and 5");
        }
        if (rating < 1 || rating > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
        }
        String review = payload.get("review") != null ? payload.get("review").toString() : "";
        exchangeService.rate(id, rating, review);
    }

    @PostMapping("/{id}/cancel")
    public void cancel(@PathVariable Long id) {}

    @GetMapping("/{id}/condition")
    public Object condition(@PathVariable Long id) {
        Exchange ex = detail(id);
        return Map.of(
            "conditionBefore", ex.getConditionBefore() != null ? ex.getConditionBefore() : "",
            "conditionAfter", ex.getConditionAfter() != null ? ex.getConditionAfter() : ""
        );
    }

    @GetMapping("/{id}/transactions")
    public Object transactions(@PathVariable Long id) {
        return transactionRepository.findAll().stream()
                .filter(t -> t.getExchange() != null && t.getExchange().getId().equals(id))
                .toList();
    }

    @PostMapping("/{id}/report")
    public void report(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        exchangeService.reportDispute(id, payload);
    }
}
