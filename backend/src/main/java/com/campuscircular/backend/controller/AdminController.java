package com.campuscircular.backend.controller;

import com.campuscircular.backend.entity.Post;
import com.campuscircular.backend.entity.User;
import com.campuscircular.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ExchangeRepository exchangeRepository;
    private final DisputeRepository disputeRepository;
    private final TransactionRepository transactionRepository;

    public AdminController(UserRepository userRepository, PostRepository postRepository, 
                           ExchangeRepository exchangeRepository, DisputeRepository disputeRepository, 
                           TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.exchangeRepository = exchangeRepository;
        this.disputeRepository = disputeRepository;
        this.transactionRepository = transactionRepository;
    }

    @GetMapping("/stats")
    public Object stats() {
        return Map.of(
            "activeMembers", userRepository.count(),
            "resourcesListed", postRepository.count(),
            "exchanges", exchangeRepository.count()
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
    public Object resolve(@PathVariable Long id) {
        return Map.of("success", true);
    }

    @GetMapping("/transactions")
    public Object transactions() {
        return transactionRepository.findAll();
    }

    @PostMapping("/clock")
    public Object clock() {
        return Map.of("success", true, "message", "Advanced time");
    }

    @PostMapping("/reset-demo")
    public Object resetDemo() {
        return Map.of("success", true);
    }
}
