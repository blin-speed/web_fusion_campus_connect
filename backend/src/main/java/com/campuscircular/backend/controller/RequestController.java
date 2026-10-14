package com.campuscircular.backend.controller;

import com.campuscircular.backend.entity.Exchange;
import com.campuscircular.backend.entity.Post;
import com.campuscircular.backend.entity.Request;
import com.campuscircular.backend.entity.User;
import com.campuscircular.backend.exception.ApiException;
import com.campuscircular.backend.repository.ExchangeRepository;
import com.campuscircular.backend.repository.PostRepository;
import com.campuscircular.backend.repository.RequestRepository;
import com.campuscircular.backend.repository.UserRepository;
import com.campuscircular.backend.security.AuthContext;
import com.campuscircular.backend.service.PricingService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class RequestController {

    private final RequestRepository requestRepository;
    private final PostRepository postRepository;
    private final ExchangeRepository exchangeRepository;
    private final PricingService pricingService;
    private final UserRepository userRepository;
    private final Clock clock;

    public RequestController(RequestRepository requestRepository,
                             PostRepository postRepository,
                             ExchangeRepository exchangeRepository,
                             PricingService pricingService,
                             UserRepository userRepository,
                             Clock clock) {
        this.requestRepository = requestRepository;
        this.postRepository = postRepository;
        this.exchangeRepository = exchangeRepository;
        this.pricingService = pricingService;
        this.userRepository = userRepository;
        this.clock = clock;
    }

    @PostMapping("/posts/{id}/requests")
    public Request submit(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!Boolean.TRUE.equals(payload.get("agreementAccepted"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Agreement not accepted");
        }

        Instant now = Instant.now(clock);
        String startStr = (String) payload.get("start");
        String endStr = (String) payload.get("end");

        Instant startAt = PostController.parseFlexibleInstant(startStr, now.plusSeconds(3600));
        Instant endAt = PostController.parseFlexibleInstant(endStr, startAt.plusSeconds(86400));

        int units = (int) pricingService.calculateUnits(startAt, endAt, post.getRateUnit());
        if (units <= 0) units = 1;

        User borrower = userRepository.findById(AuthContext.getUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "User not found"));

        Request req = new Request();
        req.setPost(post);
        req.setBorrower(borrower);
        req.setStatus("pending");
        req.setStartAt(startAt);
        req.setEndAt(endAt);
        req.setUnits(units);
        if (payload.get("message") != null) {
            req.setMessage(payload.get("message").toString());
        }
        req.setAgreementSnapshot("{\"accepted\":true}");
        req.setCreatedAt(now);

        return requestRepository.save(req);
    }

    @GetMapping("/requests/mine")
    public List<Request> mine() {
        return requestRepository.findAll().stream()
                .filter(r -> r.getBorrower() != null && r.getBorrower().getId().equals(AuthContext.getUserId()))
                .toList();
    }

    @GetMapping("/requests/incoming")
    public List<Request> incoming() {
        return requestRepository.findAll().stream()
                .filter(r -> r.getPost() != null && r.getPost().getOwner() != null &&
                        r.getPost().getOwner().getId().equals(AuthContext.getUserId()))
                .toList();
    }

    @GetMapping("/posts/{id}/requests")
    public List<Request> postRequests(@PathVariable Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (post.getOwner() == null || !post.getOwner().getId().equals(AuthContext.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return requestRepository.findAll().stream()
                .filter(r -> r.getPost() != null && r.getPost().getId().equals(id))
                .toList();
    }

    @PostMapping("/requests/{id}/accept")
    public Exchange accept(@PathVariable Long id) {
        Request req = requestRepository.findById(id).orElseThrow();
        if (req.getPost().getOwner() == null || !req.getPost().getOwner().getId().equals(AuthContext.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        req.setStatus("accepted");
        requestRepository.save(req);

        Post post = req.getPost();
        int units = req.getUnits() != null && req.getUnits() > 0 ? req.getUnits() : 1;

        BigDecimal borrowingCharge = pricingService.calculateCharge(post.getRate(), units, post.getMinCharge());
        BigDecimal platformFeePercent = new BigDecimal("8.00");
        BigDecimal platformFee = pricingService.calculateFee(borrowingCharge, platformFeePercent);
        BigDecimal transactionAmount = borrowingCharge.add(platformFee).add(post.getSecurityDeposit());

        Exchange ex = new Exchange();
        ex.setRequest(req);
        ex.setPost(post);
        ex.setOwner(post.getOwner());
        ex.setBorrower(req.getBorrower());
        ex.setState("payment_pending");
        ex.setStartAt(req.getStartAt());
        ex.setDueAt(req.getEndAt());
        ex.setUnits(units);
        ex.setRateUnit(post.getRateUnit());
        ex.setBorrowingCharge(borrowingCharge);
        ex.setPlatformFeePercent(platformFeePercent);
        ex.setPlatformFee(platformFee);
        ex.setSecurityDeposit(post.getSecurityDeposit());
        ex.setPickupLocation(post.getLocation());
        ex.setTransactionAmount(transactionAmount);
        ex.setLateFeePerUnit(post.getLateFeePerUnit() != null ? post.getLateFeePerUnit() : BigDecimal.ZERO);
        ex.setLateUnits(0);
        ex.setLateFee(BigDecimal.ZERO);
        ex.setDamageDeduction(BigDecimal.ZERO);
        ex.setExtraDue(BigDecimal.ZERO);
        ex.setCreatedAt(Instant.now(clock));
        ex.setUpdatedAt(Instant.now(clock));

        post.setAvailability("reserved");
        postRepository.save(post);

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
