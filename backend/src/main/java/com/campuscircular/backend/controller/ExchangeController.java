package com.campuscircular.backend.controller;

import com.campuscircular.backend.entity.Exchange;
import com.campuscircular.backend.repository.ExchangeRepository;
import com.campuscircular.backend.security.AuthContext;
import com.campuscircular.backend.service.ExchangeService;
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

    public ExchangeController(ExchangeService exchangeService, ExchangeRepository exchangeRepository) {
        this.exchangeService = exchangeService;
        this.exchangeRepository = exchangeRepository;
    }

    @GetMapping("/mine")
    public List<Exchange> mine(@RequestParam(required = false) String role) {
        return exchangeRepository.findAll().stream().filter(e -> {
            if ("owner".equals(role)) return e.getOwner().getId().equals(AuthContext.getUserId());
            if ("borrower".equals(role)) return e.getBorrower().getId().equals(AuthContext.getUserId());
            return e.getOwner().getId().equals(AuthContext.getUserId()) || e.getBorrower().getId().equals(AuthContext.getUserId());
        }).toList();
    }

    @GetMapping("/{id}")
    public Exchange detail(@PathVariable Long id) {
        return exchangeRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PatchMapping("/{id}/locations")
    public void locations(@PathVariable Long id, @RequestBody Map<String, Long> payload) {}

    @PostMapping("/{id}/pay")
    public void pay(@PathVariable Long id, @RequestBody Map<String, Long> payload) {
        exchangeService.pay(id, payload.get("dropoffLocationId"));
    }

    @PostMapping("/{id}/handover")
    public void handover(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        exchangeService.handover(id, payload.get("conditionBefore") != null ? payload.get("conditionBefore").toString() : "");
    }

    @PostMapping("/{id}/return")
    public void returnItem(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        exchangeService.returnItem(id, (String) payload.get("notes"));
    }

    @PostMapping("/{id}/inspect")
    public void inspect(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        BigDecimal dmg = null;
        if (payload.containsKey("damage") && payload.get("damage") != null) {
            Map<String, Object> damage = (Map<String, Object>) payload.get("damage");
            if (damage.containsKey("amount")) {
                dmg = new BigDecimal(damage.get("amount").toString());
            }
        }
        exchangeService.inspect(id, payload.get("conditionAfter") != null ? payload.get("conditionAfter").toString() : "", dmg);
    }

    @PostMapping("/{id}/damage/accept")
    public void damageAccept(@PathVariable Long id) {
        exchangeService.damageAccept(id);
    }

    @PostMapping("/{id}/damage/contest")
    public void damageContest(@PathVariable Long id) {
        // Creates a dispute, stubbed
    }

    @PostMapping("/{id}/rate")
    public void rate(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        exchangeService.rate(id, (Integer) payload.get("rating"), (String) payload.get("review"));
    }

    @PostMapping("/{id}/cancel")
    public void cancel(@PathVariable Long id) {}

    @GetMapping("/{id}/condition")
    public Object condition(@PathVariable Long id) { return Map.of(); }

    @GetMapping("/{id}/transactions")
    public Object transactions(@PathVariable Long id) { return List.of(); }

    @PostMapping("/{id}/report")
    public void report(@PathVariable Long id) {}
}
