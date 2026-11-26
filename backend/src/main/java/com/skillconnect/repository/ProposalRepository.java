package com.skillconnect.repository;

import com.skillconnect.entity.Proposal;
import com.skillconnect.entity.enums.ProposalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProposalRepository extends JpaRepository<Proposal, Long> {
    List<Proposal> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    Page<Proposal> findByProject_Client_IdOrderByCreatedAtDesc(Long clientId, Pageable pageable);
    Page<Proposal> findByFreelancerIdOrderByCreatedAtDesc(Long freelancerId, Pageable pageable);
    boolean existsByProjectIdAndFreelancerId(Long projectId, Long freelancerId);
    long countByFreelancerIdAndStatus(Long freelancerId, ProposalStatus status);
}
