package com.campuscircular.backend.service;

import com.campuscircular.backend.entity.*;
import com.campuscircular.backend.repository.*;
import com.campuscircular.backend.security.AuthContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;

@Service
public class ExchangeService {

    private final ExchangeRepository exchangeRepository;
    private final RequestRepository requestRepository;
    private final PostRepository postRepository;
    private final TransactionRepository transactionRepository;
    private final ExchangeEventRepository exchangeEventRepository;
    private final PricingService pricingService;
    private final Clock clock;
    private final LocationRepository locationRepository;

    public ExchangeService(ExchangeRepository exchangeRepository, RequestRepository requestRepository,
                           PostRepository postRepository, TransactionRepository transactionRepository,
                           ExchangeEventRepository exchangeEventRepository, PricingService pricingService,
                           Clock clock, LocationRepository locationRepository) {
        this.exchangeRepository = exchangeRepository;
        this.requestRepository = requestRepository;
        this.postRepository = postRepository;
        this.transactionRepository = transactionRepository;
        this.exchangeEventRepository = exchangeEventRepository;
        this.pricingService = pricingService;
        this.clock = clock;
        this.locationRepository = locationRepository;
    }

    private Exchange getExchange(Long id) {
        return exchangeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exchange not found"));
    }

    private void recordEvent(Exchange exchange, String note) {
        ExchangeEvent ev = new ExchangeEvent();
        ev.setExchange(exchange);
        ev.setState(exchange.getState());
        ev.setActorId(AuthContext.getUserId());
        ev.setNote(note);
        ev.setCreatedAt(Instant.now(clock));
        exchangeEventRepository.save(ev);
    }
    
    private void recordTx(Exchange exchange, String type, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) return;
        Transaction tx = new Transaction();
        tx.setExchange(exchange);
        tx.setType(type);
        tx.setAmount(amount);
        tx.setCreatedAt(Instant.now(clock));
        transactionRepository.save(tx);
    }

    @Transactional
    public void pay(Long exchangeId, Long dropoffLocationId) {
        Exchange ex = getExchange(exchangeId);
        if (!"payment_pending".equals(ex.getState())) throw new IllegalStateException("Not in payment_pending");
        if (!ex.getBorrower().getId().equals(AuthContext.getUserId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);

        if (dropoffLocationId != null) {
            ex.setDropoffLocation(locationRepository.findById(dropoffLocationId).orElse(null));
        }

        ex.setState("handover");
        exchangeRepository.save(ex);

        recordTx(ex, "BORROWING_CHARGE", ex.getBorrowingCharge());
        recordTx(ex, "PLATFORM_FEE", ex.getPlatformFee());
        recordTx(ex, "DEPOSIT_HOLD", ex.getSecurityDeposit());

        recordEvent(ex, "Payment completed");
    }

    @Transactional
    public void handover(Long exchangeId, String conditionBefore) {
        Exchange ex = getExchange(exchangeId);
        if (!"handover".equals(ex.getState())) throw new IllegalStateException("Not in handover");
        if (!ex.getOwner().getId().equals(AuthContext.getUserId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);

        ex.setState("borrowed");
        ex.setHandedOverAt(Instant.now(clock));
        ex.setConditionBefore(toJson(conditionBefore));
        exchangeRepository.save(ex);
        
        Post post = ex.getPost();
        post.setAvailability("lent");
        postRepository.save(post);

        recordEvent(ex, "Handed over to borrower");
    }

    @Transactional
    public void returnItem(Long exchangeId, String notes) {
        Exchange ex = getExchange(exchangeId);
        if (!"borrowed".equals(ex.getState())) throw new IllegalStateException("Not borrowed");
        if (!ex.getBorrower().getId().equals(AuthContext.getUserId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);

        ex.setState("returned");
        ex.setReturnedAt(Instant.now(clock));
        
        long lateUnits = pricingService.calculateLateUnits(ex.getReturnedAt(), ex.getDueAt(), ex.getRateUnit());
        ex.setLateUnits((int) lateUnits);
        ex.setLateFee(pricingService.calculateLateFee(lateUnits, ex.getLateFeePerUnit()));
        
        exchangeRepository.save(ex);
        recordEvent(ex, "Returned by borrower. Notes: " + notes);
    }

    @Transactional
    public void inspect(Long exchangeId, String conditionAfter, BigDecimal damageClaimAmount) {
        Exchange ex = getExchange(exchangeId);
        if (!"returned".equals(ex.getState())) throw new IllegalStateException("Not returned");
        if (!ex.getOwner().getId().equals(AuthContext.getUserId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);

        ex.setState("inspected");
        ex.setConditionAfter(toJson(conditionAfter));
        
        if (damageClaimAmount != null && damageClaimAmount.compareTo(BigDecimal.ZERO) > 0) {
            ex.setDamageClaim("{\"amount\":" + damageClaimAmount + ",\"status\":\"pending\"}");
            exchangeRepository.save(ex);
            recordEvent(ex, "Inspected with damage claim: " + damageClaimAmount);
        } else {
            exchangeRepository.save(ex);
            recordEvent(ex, "Inspected with no damage");
            settle(exchangeId, BigDecimal.ZERO);
        }
    }

    @Transactional
    public void damageAccept(Long exchangeId) {
        Exchange ex = getExchange(exchangeId);
        if (!"inspected".equals(ex.getState())) throw new IllegalStateException("Not inspected");
        if (!ex.getBorrower().getId().equals(AuthContext.getUserId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        
        // Parsing json claim amount naively for speed
        String claim = ex.getDamageClaim();
        BigDecimal amount = BigDecimal.ZERO;
        if (claim != null && claim.contains("\"amount\":")) {
            String val = claim.split("\"amount\":")[1].split(",")[0].replace("}", "").trim();
            amount = new BigDecimal(val);
        }
        
        ex.setDamageClaim(claim.replace("\"pending\"", "\"accepted\""));
        exchangeRepository.save(ex);
        recordEvent(ex, "Damage claim accepted");
        settle(exchangeId, amount);
    }
    
    @Transactional
    public void settle(Long exchangeId, BigDecimal finalDamageDeduction) {
        Exchange ex = getExchange(exchangeId);
        ex.setDamageDeduction(finalDamageDeduction);
        
        BigDecimal totalDeductions = ex.getLateFee().add(finalDamageDeduction);
        ex.setDepositRefund(pricingService.calculateDepositRefund(ex.getSecurityDeposit(), totalDeductions));
        ex.setExtraDue(pricingService.calculateExtraDue(ex.getSecurityDeposit(), totalDeductions));
        ex.setOwnerPayout(pricingService.calculateOwnerPayout(ex.getBorrowingCharge(), totalDeductions));
        
        ex.setState("settled");
        exchangeRepository.save(ex);
        
        recordTx(ex, "LATE_FEE", ex.getLateFee());
        recordTx(ex, "DAMAGE_DEDUCTION", finalDamageDeduction);
        recordTx(ex, "DEPOSIT_REFUND", ex.getDepositRefund());
        recordTx(ex, "EXTRA_CHARGE", ex.getExtraDue());
        recordTx(ex, "OWNER_PAYOUT", ex.getOwnerPayout());
        
        Post post = ex.getPost();
        post.setAvailability("available");
        postRepository.save(post);
        
        recordEvent(ex, "Exchange settled automatically");
    }

    @Transactional
    public void rate(Long exchangeId, Integer rating, String review) {
        Exchange ex = getExchange(exchangeId);
        if (!"settled".equals(ex.getState())) throw new IllegalStateException("Not settled");
        if (!ex.getBorrower().getId().equals(AuthContext.getUserId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        
        ex.setState("rated");
        ex.setRating(rating);
        ex.setReview(review);
        exchangeRepository.save(ex);
        recordEvent(ex, "Rated " + rating + " stars");
    }

    /** Ensure value is stored as valid JSON for MySQL JSON columns. */
    private String toJson(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        if (trimmed.startsWith("{") || trimmed.startsWith("[") || trimmed.startsWith("\"")) return trimmed;
        // Wrap plain text as a JSON object
        return "{\"notes\":\"" + trimmed.replace("\"", "\\\"") + "\"}";
    }
}
