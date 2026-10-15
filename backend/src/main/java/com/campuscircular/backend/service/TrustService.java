package com.campuscircular.backend.service;

import com.campuscircular.backend.repository.DisputeRepository;
import com.campuscircular.backend.repository.ExchangeRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class TrustService {

    private final ExchangeRepository exchangeRepository;
    private final DisputeRepository disputeRepository;

    public TrustService(ExchangeRepository exchangeRepository, DisputeRepository disputeRepository) {
        this.exchangeRepository = exchangeRepository;
        this.disputeRepository = disputeRepository;
    }

    public Map<String, Object> getUserTrustStats(Long userId) {
        Map<String, Object> stats = new LinkedHashMap<>();

        long successfulExchanges = exchangeRepository.findAll().stream()
                .filter(e -> (e.getOwner() != null && userId.equals(e.getOwner().getId())) ||
                             (e.getBorrower() != null && userId.equals(e.getBorrower().getId())))
                .filter(e -> "settled".equals(e.getState()) || "rated".equals(e.getState()))
                .count();

        long lateReturns = exchangeRepository.findAll().stream()
                .filter(e -> e.getBorrower() != null && userId.equals(e.getBorrower().getId()))
                .filter(e -> e.getLateUnits() != null && e.getLateUnits() > 0)
                .count();

        long disputes = disputeRepository.findAll().stream()
                .filter(d -> d.getExchange() != null &&
                        ((d.getExchange().getOwner() != null && userId.equals(d.getExchange().getOwner().getId())) ||
                         (d.getExchange().getBorrower() != null && userId.equals(d.getExchange().getBorrower().getId()))))
                .count();

        var ratedExchanges = exchangeRepository.findAll().stream()
                .filter(e -> (e.getOwner() != null && userId.equals(e.getOwner().getId())) ||
                             (e.getBorrower() != null && userId.equals(e.getBorrower().getId())))
                .filter(e -> e.getRating() != null)
                .toList();

        long ratingsCount = ratedExchanges.size();
        Double trustScore = null;
        if (ratingsCount > 0) {
            double sum = ratedExchanges.stream().mapToInt(e -> e.getRating()).sum();
            trustScore = BigDecimal.valueOf(sum / (double) ratingsCount)
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        boolean isVerified = ratedExchanges.stream()
                .anyMatch(e -> ("settled".equals(e.getState()) || "rated".equals(e.getState()))
                            && e.getRating() != null && e.getRating() >= 3);

        stats.put("trustScore", trustScore);
        stats.put("isVerified", isVerified);
        stats.put("verified", isVerified);
        stats.put("successfulExchanges", successfulExchanges);
        stats.put("lateReturns", lateReturns);
        stats.put("disputes", disputes);
        stats.put("ratingsCount", ratingsCount);

        return stats;
    }
}
