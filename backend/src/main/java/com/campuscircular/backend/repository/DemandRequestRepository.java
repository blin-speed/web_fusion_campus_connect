package com.campuscircular.backend.repository;
import com.campuscircular.backend.entity.DemandRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DemandRequestRepository extends JpaRepository<DemandRequest, Long> {
}
