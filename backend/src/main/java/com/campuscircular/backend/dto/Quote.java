package com.campuscircular.backend.dto;

public record Quote(Long postId, java.time.Instant start, java.time.Instant end, java.math.BigDecimal transactionAmount, Object agreement) {}
