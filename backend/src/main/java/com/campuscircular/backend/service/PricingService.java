package com.campuscircular.backend.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;

@Service
public class PricingService {

    public long calculateUnitHours(String rateUnit) {
        return "HOUR".equalsIgnoreCase(rateUnit) ? 1 : 24;
    }

    public long calculateUnits(Instant startAt, Instant endAt, String rateUnit) {
        long unitHours = calculateUnitHours(rateUnit);
        long durationHours = java.time.Duration.between(startAt, endAt).toHours();
        if (durationHours <= 0) return 1;
        long units = (long) Math.ceil((double) durationHours / unitHours);
        return Math.max(1, units);
    }

    public BigDecimal calculateCharge(BigDecimal rate, long units, BigDecimal minCharge) {
        BigDecimal charge = rate.multiply(BigDecimal.valueOf(units));
        return charge.max(minCharge);
    }

    public BigDecimal calculateFee(BigDecimal charge, BigDecimal platformFeePercent) {
        return charge.multiply(platformFeePercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    public long calculateLateUnits(Instant returnedAt, Instant dueAt, String rateUnit) {
        if (returnedAt == null || !returnedAt.isAfter(dueAt)) {
            return 0;
        }
        long unitHours = calculateUnitHours(rateUnit);
        long lateHours = Duration.between(dueAt, returnedAt).toHours();
        if (lateHours == 0) {
            long lateMillis = Duration.between(dueAt, returnedAt).toMillis();
            if (lateMillis > 0) return 1;
            return 0;
        }
        return (long) Math.ceil((double) lateHours / unitHours);
    }

    public BigDecimal calculateLateFee(long lateUnits, BigDecimal lateFeePerUnit) {
        return lateFeePerUnit.multiply(BigDecimal.valueOf(lateUnits));
    }
    
    public BigDecimal calculateDepositRefund(BigDecimal deposit, BigDecimal deductions) {
        return deposit.subtract(deductions).max(BigDecimal.ZERO);
    }
    
    public BigDecimal calculateExtraDue(BigDecimal deposit, BigDecimal deductions) {
        return deductions.subtract(deposit).max(BigDecimal.ZERO);
    }
    
    public BigDecimal calculateOwnerPayout(BigDecimal charge, BigDecimal deductions) {
        return charge.add(deductions);
    }
}
