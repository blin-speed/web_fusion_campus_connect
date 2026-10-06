package com.campuscircular.backend.controller;

import com.campuscircular.backend.entity.Post;
import com.campuscircular.backend.repository.PostRepository;
import com.campuscircular.backend.security.AuthContext;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {
    private final PostRepository postRepository;
    
    public PostController(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @GetMapping
    public List<Post> discover() {
        return postRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public Post detail(@PathVariable Long id) {
        return postRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
    
    @PostMapping
    public Post create(@RequestBody Post post) {
        post.setOwner(new com.campuscircular.backend.entity.User());
        post.getOwner().setId(AuthContext.getUserId());
        post.setApprovalStatus("approved"); // Auto approve for demo
        post.setAvailability("available");
        post.setCreatedAt(java.time.Instant.now());
        return postRepository.save(post);
    }
    
    @PutMapping("/{id}")
    public Post update(@PathVariable Long id, @RequestBody Post post) {
        Post existing = detail(id);
        if (!existing.getOwner().getId().equals(AuthContext.getUserId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        // Minimal update for demo
        existing.setTitle(post.getTitle());
        return postRepository.save(existing);
    }
    
    @DeleteMapping("/{id}")
    public void unlist(@PathVariable Long id) {
        Post existing = detail(id);
        if (!existing.getOwner().getId().equals(AuthContext.getUserId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        postRepository.delete(existing);
    }
    
    @GetMapping("/mine")
    public List<Post> mine() {
        return postRepository.findAll().stream().filter(p -> p.getOwner().getId().equals(AuthContext.getUserId())).toList();
    }
    
    @GetMapping("/{id}/quote")
    public Object quote(@PathVariable Long id) {
        Post p = detail(id);
        return java.util.Map.of(
            "postId", p.getId(),
            "transactionAmount", p.getSecurityDeposit().add(p.getRate()),
            "securityDeposit", p.getSecurityDeposit(),
            "borrowingCharge", p.getRate(),
            "platformFee", java.math.BigDecimal.ZERO,
            "agreement", java.util.Map.of("resource", p.getTitle())
        );
    }
    
    @GetMapping("/{id}/history")
    public Object history(@PathVariable Long id) {
        return List.of();
    }
}
