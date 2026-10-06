package com.campuscircular.backend.controller;

import com.campuscircular.backend.entity.Post;
import com.campuscircular.backend.entity.User;
import com.campuscircular.backend.entity.Exchange;
import com.campuscircular.backend.entity.Dispute;
import com.campuscircular.backend.entity.Transaction;
import com.campuscircular.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.math.BigDecimal;
import java.util.List;
import java.time.Instant;
import java.time.Clock;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ExchangeRepository exchangeRepository;
    private final DisputeRepository disputeRepository;
    private final TransactionRepository transactionRepository;
    private final SettingRepository settingRepository;
    private final Clock clock;
    private final com.campuscircular.backend.config.ClockConfig clockConfig;

    public AdminController(UserRepository userRepository, PostRepository postRepository, 
                           ExchangeRepository exchangeRepository, DisputeRepository disputeRepository, 
                           TransactionRepository transactionRepository, SettingRepository settingRepository, 
                           Clock clock, com.campuscircular.backend.config.ClockConfig clockConfig) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.exchangeRepository = exchangeRepository;
        this.disputeRepository = disputeRepository;
        this.transactionRepository = transactionRepository;
        this.settingRepository = settingRepository;
        this.clock = clock;
        this.clockConfig = clockConfig;
    }

    @GetMapping("/stats")
    public Object stats() {
        List<Exchange> exchangesList = exchangeRepository.findAll();
        long overdueCount = exchangesList.stream().filter(e -> "BORROWED".equals(e.getState()) && e.getDueAt() != null && e.getDueAt().isBefore(clock.instant())).count();
        
        List<Dispute> disputes = disputeRepository.findAll();
        long openDisputes = disputes.stream().filter(d -> "open".equalsIgnoreCase(d.getStatus())).count();

        List<Transaction> txs = transactionRepository.findAll();
        BigDecimal gmv = txs.stream().filter(t -> "payment".equalsIgnoreCase(t.getType())).map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal deposits = exchangesList.stream().map(e -> e.getSecurityDeposit() != null ? e.getSecurityDeposit() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal platformFeesCollected = txs.stream().filter(t -> "fee".equalsIgnoreCase(t.getType())).map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // As a fallback for fee if not explicitly recorded as "fee" transaction type
        if (platformFeesCollected.compareTo(BigDecimal.ZERO) == 0) {
            platformFeesCollected = exchangesList.stream().map(e -> e.getPlatformFee() != null ? e.getPlatformFee() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        return Map.of(
            "activeMembers", userRepository.count(),
            "resourcesListed", postRepository.count(),
            "exchanges", exchangeRepository.count(),
            "overdueCount", overdueCount,
            "openDisputes", openDisputes,
            "gmv", gmv,
            "deposits", deposits,
            "platformFeesCollected", platformFeesCollected
        );
    }

    @GetMapping("/users")
    public Object users() {
        return userRepository.findAll();
    }

    @PostMapping("/users/{id}/suspend")
    public User suspend(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User u = userRepository.findById(id).orElseThrow();
        u.setVerificationStatus("suspended");
        u.setSuspendedReason(payload.getOrDefault("reason", "Violated terms"));
        return userRepository.save(u);
    }

    @PostMapping("/users/{id}/unsuspend")
    public User unsuspend(@PathVariable Long id) {
        User u = userRepository.findById(id).orElseThrow();
        u.setVerificationStatus("verified");
        u.setSuspendedReason(null);
        return userRepository.save(u);
    }

    @PostMapping("/users/{id}/verify")
    public User verify(@PathVariable Long id) {
        User u = userRepository.findById(id).orElseThrow();
        u.setVerificationStatus("verified");
        return userRepository.save(u);
    }

    @GetMapping("/posts")
    public Object posts() {
        return postRepository.findAll();
    }

    @PostMapping("/posts/{id}/approve")
    public Post approve(@PathVariable Long id) {
        Post p = postRepository.findById(id).orElseThrow();
        p.setApprovalStatus("approved");
        return postRepository.save(p);
    }

    @PostMapping("/posts/{id}/reject")
    public Post reject(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Post p = postRepository.findById(id).orElseThrow();
        p.setApprovalStatus("rejected");
        p.setRejectionReason(payload.getOrDefault("reason", "Unsuitable content"));
        return postRepository.save(p);
    }

    @PostMapping("/posts/{id}/flag")
    public Post flag(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Post p = postRepository.findById(id).orElseThrow();
        p.setFlagged(true);
        p.setFlagReason(payload.getOrDefault("reason", "Flagged by admin"));
        return postRepository.save(p);
    }

    @PostMapping("/posts/{id}/unflag")
    public Post unflag(@PathVariable Long id) {
        Post p = postRepository.findById(id).orElseThrow();
        p.setFlagged(false);
        p.setFlagReason(null);
        return postRepository.save(p);
    }

    @GetMapping("/exchanges")
    public Object exchanges() {
        return exchangeRepository.findAll();
    }

    @GetMapping("/disputes")
    public Object disputes() {
        return disputeRepository.findAll();
    }

    @PostMapping("/disputes/{id}/resolve")
    public Object resolve(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Dispute d = disputeRepository.findById(id).orElseThrow();
        d.setStatus("resolved");
        d.setResolution(payload.getOrDefault("resolution", "Resolved by admin"));
        d.setResolvedAt(clock.instant());
        return disputeRepository.save(d);
    }

    @GetMapping("/transactions")
    public Object transactions() {
        return transactionRepository.findAll();
    }

    @GetMapping("/settings")
    public Object getSettings() {
        return settingRepository.findAll();
    }

    @PostMapping("/settings")
    public Object updateSetting(@RequestBody Map<String, String> payload) {
        String key = payload.get("key");
        String value = payload.get("value");
        com.campuscircular.backend.entity.Setting s = settingRepository.findById(key).orElse(new com.campuscircular.backend.entity.Setting());
        s.setKey(key);
        s.setValue(value);
        return settingRepository.save(s);
    }

    @PostMapping("/clock")
    public Object clock(@RequestBody(required = false) Map<String, Integer> payload) {
        int offset = (payload != null && payload.containsKey("offsetDays")) ? payload.get("offsetDays") : 1;
        clockConfig.advanceDays(offset);
        return Map.of("success", true, "message", "Advanced time by " + offset + " days", "currentInstant", clock.instant().toString());
    }

    @PostMapping("/reset-demo")
    public Object resetDemo() {
        // Dummy implementation for now, can be expanded if needed
        return Map.of("success", true);
    }
}
