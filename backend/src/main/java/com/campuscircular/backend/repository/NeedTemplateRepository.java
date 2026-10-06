package com.campuscircular.backend.repository;
import com.campuscircular.backend.entity.NeedTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NeedTemplateRepository extends JpaRepository<NeedTemplate, Long> {
}
