package com.campuscircular.backend.repository;
import com.campuscircular.backend.entity.ExchangeEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExchangeEventRepository extends JpaRepository<ExchangeEvent, Long> {
}
