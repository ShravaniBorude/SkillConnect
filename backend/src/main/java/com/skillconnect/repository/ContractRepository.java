package com.skillconnect.repository;

import com.skillconnect.entity.Contract;
import com.skillconnect.entity.enums.ContractStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, Long> {
    Page<Contract> findByClientIdOrderByCreatedAtDesc(Long clientId, Pageable pageable);
    Page<Contract> findByFreelancerIdOrderByCreatedAtDesc(Long freelancerId, Pageable pageable);
    Optional<Contract> findByProposalId(Long proposalId);
    long countByStatus(ContractStatus status);
    long countByClientIdAndStatus(Long clientId, ContractStatus status);
    long countByFreelancerIdAndStatus(Long freelancerId, ContractStatus status);
}
