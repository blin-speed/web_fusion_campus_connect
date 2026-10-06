package com.campuscircular.backend.controller;

import com.campuscircular.backend.entity.Exchange;
import com.campuscircular.backend.entity.Post;
import com.campuscircular.backend.entity.Request;
import com.campuscircular.backend.entity.User;
import com.campuscircular.backend.repository.ExchangeRepository;
import com.campuscircular.backend.repository.PostRepository;
import com.campuscircular.backend.repository.RequestRepository;
import com.campuscircular.backend.security.AuthContext;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class RequestController {
    
    private final RequestRepository requestRepository;
    private final PostRepository postRepository;
    private final ExchangeRepository exchangeRepository;
    
    public RequestController(RequestRepository requestRepository, PostRepository postRepository, ExchangeRepository exchangeRepository) {
        this.requestRepository = requestRepository;
        this.postRepository = postRepository;
        this.exchangeRepository = exchangeRepository;
    }

    @PostMapping("/posts/{id}/requests")
    public Request submit(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Post post = postRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (Boolean.TRUE.equals(payload.get("agreementAccepted"))) {
            Request req = new Request();
            req.setPost(post);
            req.setBorrower(new User());
            req.getBorrower().setId(AuthContext.getUserId());
            req.setStatus("pending");
            req.setStartAt(Instant.parse((String) payload.get("start")));
            req.setEndAt(Instant.parse((String) payload.get("end")));
            req.setUnits(1);
            req.setAgreementSnapshot("{\"accepted\":true}");
            req.setCreatedAt(Instant.now());
            return requestRepository.save(req);
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Agreement not accepted");
    }

    @GetMapping("/requests/mine")
    public List<Request> mine() {
        return requestRepository.findAll().stream().filter(r -> r.getBorrower().getId().equals(AuthContext.getUserId())).toList();
    }

    @GetMapping("/posts/{id}/requests")
    public List<Request> postRequests(@PathVariable Long id) {
        Post post = postRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!post.getOwner().getId().equals(AuthContext.getUserId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return requestRepository.findAll().stream().filter(r -> r.getPost().getId().equals(id)).toList();
    }

    @PostMapping("/requests/{id}/accept")
    public Exchange accept(@PathVariable Long id) {
        Request req = requestRepository.findById(id).orElseThrow();
        if (!req.getPost().getOwner().getId().equals(AuthContext.getUserId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        req.setStatus("accepted");
        requestRepository.save(req);
        
        Exchange ex = new Exchange();
        ex.setRequest(req);
        ex.setPost(req.getPost());
        ex.setOwner(req.getPost().getOwner());
        ex.setBorrower(req.getBorrower());
        ex.setState("payment_pending");
        ex.setStartAt(req.getStartAt());
        ex.setDueAt(req.getEndAt());
        ex.setUnits(req.getUnits());
        ex.setRateUnit(req.getPost().getRateUnit());
        ex.setBorrowingCharge(req.getPost().getRate());
        ex.setPlatformFeePercent(new BigDecimal("8.00"));
        ex.setPlatformFee(new BigDecimal("20.00")); // Hardcoded for demo
        ex.setSecurityDeposit(req.getPost().getSecurityDeposit());
        ex.setPickupLocation(req.getPost().getLocation());
        ex.setTransactionAmount(ex.getBorrowingCharge().add(ex.getPlatformFee()).add(ex.getSecurityDeposit()));
        ex.setLateFeePerUnit(req.getPost().getLateFeePerUnit() != null ? req.getPost().getLateFeePerUnit() : BigDecimal.ZERO);
        ex.setLateUnits(0);
        ex.setLateFee(BigDecimal.ZERO);
        ex.setDamageDeduction(BigDecimal.ZERO);
        ex.setExtraDue(BigDecimal.ZERO);
        ex.setCreatedAt(Instant.now());
        ex.setUpdatedAt(Instant.now());
        return exchangeRepository.save(ex);
    }

    @PostMapping("/requests/{id}/reject")
    public Request reject(@PathVariable Long id) {
        Request req = requestRepository.findById(id).orElseThrow();
        req.setStatus("rejected");
        return requestRepository.save(req);
    }

    @PostMapping("/requests/{id}/cancel")
    public Request cancel(@PathVariable Long id) {
        Request req = requestRepository.findById(id).orElseThrow();
        req.setStatus("cancelled");
        return requestRepository.save(req);
    }
}
