package com.campuscircular.backend.controller;

import com.campuscircular.backend.entity.Post;
import com.campuscircular.backend.entity.User;
import com.campuscircular.backend.entity.Exchange;
import com.campuscircular.backend.entity.Dispute;
import com.campuscircular.backend.entity.Transaction;
import com.campuscircular.backend.repository.*;
import com.campuscircular.backend.service.ExchangeService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.math.BigDecimal;
import java.util.List;
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
    private final ExchangeService exchangeService;
    private final Clock clock;
    private final com.campuscircular.backend.config.ClockConfig clockConfig;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public AdminController(UserRepository userRepository,
                           PostRepository postRepository,
                           ExchangeRepository exchangeRepository,
                           DisputeRepository disputeRepository,
                           TransactionRepository transactionRepository,
                           SettingRepository settingRepository,
                           ExchangeService exchangeService,
                           Clock clock,
                           com.campuscircular.backend.config.ClockConfig clockConfig) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.exchangeRepository = exchangeRepository;
        this.disputeRepository = disputeRepository;
        this.transactionRepository = transactionRepository;
        this.settingRepository = settingRepository;
        this.exchangeService = exchangeService;
        this.clock = clock;
        this.clockConfig = clockConfig;
    }

    @GetMapping("/stats")
    public Object stats() {
        List<Exchange> exchangesList = exchangeRepository.findAll();
        long overdueCount = exchangesList.stream()
                .filter(e -> "borrowed".equalsIgnoreCase(e.getState()) && e.getDueAt() != null && e.getDueAt().isBefore(clock.instant()))
                .count();

        List<Dispute> disputes = disputeRepository.findAll();
        long openDisputes = disputes.stream()
                .filter(d -> "open".equalsIgnoreCase(d.getStatus()))
                .count();

        List<Transaction> txs = transactionRepository.findAll();
        BigDecimal gmv = txs.stream()
                .filter(t -> "BORROWING_CHARGE".equalsIgnoreCase(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (gmv.compareTo(BigDecimal.ZERO) == 0) {
            gmv = exchangesList.stream()
                    .map(e -> e.getBorrowingCharge() != null ? e.getBorrowingCharge() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal deposits = exchangesList.stream()
                .map(e -> e.getSecurityDeposit() != null ? e.getSecurityDeposit() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal platformFeesCollected = txs.stream()
                .filter(t -> "PLATFORM_FEE".equalsIgnoreCase(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // As a fallback for fee if not explicitly recorded as "PLATFORM_FEE" transaction type
        if (platformFeesCollected.compareTo(BigDecimal.ZERO) == 0) {
            platformFeesCollected = exchangesList.stream()
                    .map(e -> e.getPlatformFee() != null ? e.getPlatformFee() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
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
    public Object resolve(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Dispute d = disputeRepository.findById(id).orElseThrow();

        String rawRes = payload != null && payload.get("resolution") != null
                ? payload.get("resolution").toString().toLowerCase().trim()
                : "favor_owner";

        String validRes;
        if ("favor_borrower".equals(rawRes) || "favor_owner".equals(rawRes) || "split".equals(rawRes)) {
            validRes = rawRes;
        } else {
            validRes = "favor_owner";
        }

        BigDecimal finalDeduction;
        if (payload != null && payload.get("finalDeduction") != null) {
            finalDeduction = new BigDecimal(payload.get("finalDeduction").toString());
        } else if ("favor_borrower".equals(validRes)) {
            finalDeduction = BigDecimal.ZERO;
        } else if ("split".equals(validRes)) {
            BigDecimal claimed = d.getClaimedAmount() != null ? d.getClaimedAmount() : BigDecimal.ZERO;
            finalDeduction = claimed.divide(BigDecimal.valueOf(2), 2, java.math.RoundingMode.HALF_UP);
        } else {
            finalDeduction = d.getClaimedAmount() != null ? d.getClaimedAmount() : BigDecimal.ZERO;
        }

        String adminNote = payload != null && payload.get("adminNote") != null
                ? payload.get("adminNote").toString()
                : "Resolved by Admin";

        d.setStatus("resolved");
        d.setResolution(validRes);
        d.setFinalDeduction(finalDeduction);
        d.setAdminNote(adminNote);
        d.setResolvedAt(clock.instant());
        Dispute savedDispute = disputeRepository.save(d);

        if (d.getExchange() != null &&
            !"settled".equals(d.getExchange().getState()) &&
            !"rated".equals(d.getExchange().getState())) {
            exchangeService.settle(d.getExchange().getId(), finalDeduction);
        }

        return savedDispute;
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
        com.campuscircular.backend.entity.Setting s = settingRepository.findById(key)
                .orElse(new com.campuscircular.backend.entity.Setting());
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
        if (jdbcTemplate != null) {
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
            jdbcTemplate.execute("TRUNCATE TABLE transactions");
            jdbcTemplate.execute("TRUNCATE TABLE disputes");
            jdbcTemplate.execute("TRUNCATE TABLE exchange_events");
            jdbcTemplate.execute("TRUNCATE TABLE exchanges");
            jdbcTemplate.execute("TRUNCATE TABLE requests");
            jdbcTemplate.execute("TRUNCATE TABLE photos");
            jdbcTemplate.execute("TRUNCATE TABLE posts");
            jdbcTemplate.execute("TRUNCATE TABLE demand_requests");
            jdbcTemplate.execute("TRUNCATE TABLE need_templates");
            jdbcTemplate.execute("TRUNCATE TABLE item_types");
            jdbcTemplate.execute("TRUNCATE TABLE users");
            jdbcTemplate.execute("TRUNCATE TABLE categories");
            jdbcTemplate.execute("TRUNCATE TABLE locations");
            jdbcTemplate.execute("TRUNCATE TABLE settings");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
        }
        clockConfig.resetOffset();
        return Map.of("success", true, "message", "Database completely cleaned and reset to empty state");
    }
}
