package com.skillconnect.repository;

import com.skillconnect.entity.FreelancerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface FreelancerProfileRepository
        extends JpaRepository<FreelancerProfile, Long>, JpaSpecificationExecutor<FreelancerProfile> {
    Optional<FreelancerProfile> findByUserId(Long userId);
}
