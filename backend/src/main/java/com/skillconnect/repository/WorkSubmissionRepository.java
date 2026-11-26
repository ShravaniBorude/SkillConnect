package com.skillconnect.repository;

import com.skillconnect.entity.WorkSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkSubmissionRepository extends JpaRepository<WorkSubmission, Long> {
    List<WorkSubmission> findByContractIdOrderByCreatedAtDesc(Long contractId);
    List<WorkSubmission> findByFreelancerIdOrderByCreatedAtDesc(Long freelancerId);
    long countByContractId(Long contractId);
}
