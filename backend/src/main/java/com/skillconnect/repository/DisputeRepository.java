package com.skillconnect.repository;

import com.skillconnect.entity.Dispute;
import com.skillconnect.entity.enums.DisputeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    Page<Dispute> findByStatusOrderByCreatedAtDesc(DisputeStatus status, Pageable pageable);
    Page<Dispute> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Dispute> findByRaisedByIdOrAgainstUserIdOrderByCreatedAtDesc(Long raisedById, Long againstUserId, Pageable pageable);
    long countByStatus(DisputeStatus status);
}
