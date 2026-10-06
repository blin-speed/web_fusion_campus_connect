package com.campuscircular.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.Duration;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicReference;

@Configuration
public class ClockConfig {
    
    private final AtomicReference<Duration> offset = new AtomicReference<>(Duration.ZERO);

    @Bean
    public Clock clock() {
        return new Clock() {
            @Override
            public java.time.ZoneId getZone() {
                return ZoneOffset.UTC;
            }

            @Override
            public Clock withZone(java.time.ZoneId zone) {
                return Clock.system(zone);
            }

            @Override
            public java.time.Instant instant() {
                return Clock.systemUTC().instant().plus(offset.get());
            }
        };
    }

    public void setOffset(Duration duration) {
        offset.set(duration);
    }
    
    public void advanceDays(int days) {
        offset.updateAndGet(d -> d.plus(Duration.ofDays(days)));
    }

    public void advanceHours(int hours) {
        offset.updateAndGet(d -> d.plus(Duration.ofHours(hours)));
    }

    public void resetOffset() {
        offset.set(Duration.ZERO);
    }
    
    public Duration getOffset() {
        return offset.get();
    }
}
