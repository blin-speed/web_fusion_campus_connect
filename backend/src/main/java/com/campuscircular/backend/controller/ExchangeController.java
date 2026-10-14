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
    private final ObjectMapper objectMapper;

    public ExchangeController(ExchangeService exchangeService,
                              ExchangeRepository exchangeRepository,
                              TransactionRepository transactionRepository,
                              @org.springframework.beans.factory.annotation.Autowired(required = false) ObjectMapper objectMapper) {
        this.exchangeService = exchangeService;
        this.exchangeRepository = exchangeRepository;
        this.transactionRepository = transactionRepository;
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
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
        return exchangeRepository.findAll().stream().filter(e -> {
            if ("owner".equals(role)) return e.getOwner() != null && e.getOwner().getId().equals(AuthContext.getUserId());
            if ("borrower".equals(role)) return e.getBorrower() != null && e.getBorrower().getId().equals(AuthContext.getUserId());
            return (e.getOwner() != null && e.getOwner().getId().equals(AuthContext.getUserId())) ||
                   (e.getBorrower() != null && e.getBorrower().getId().equals(AuthContext.getUserId()));
        }).toList();
    }

    @GetMapping("/{id}")
    public Exchange detail(@PathVariable Long id) {
        return exchangeRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
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
        exchangeService.handover(id, extractJson(payload.get("conditionBefore")));
    }

    @PostMapping("/{id}/return")
    public void returnItem(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        exchangeService.returnItem(id, (String) payload.get("notes"));
    }

    @PostMapping("/{id}/inspect")
    public void inspect(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
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
        Integer rating = payload.get("rating") != null ? Integer.valueOf(payload.get("rating").toString()) : 5;
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
