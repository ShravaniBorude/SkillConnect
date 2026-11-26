package com.skillconnect.repository;

import com.skillconnect.entity.PortfolioItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioItemRepository extends JpaRepository<PortfolioItem, Long> {
    List<PortfolioItem> findByFreelancerProfileIdOrderByCreatedAtDesc(Long freelancerProfileId);
}
