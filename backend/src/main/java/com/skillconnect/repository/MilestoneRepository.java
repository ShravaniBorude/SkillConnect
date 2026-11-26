package com.skillconnect.repository;

import com.skillconnect.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findByContractIdOrderBySequenceOrderAsc(Long contractId);
}
