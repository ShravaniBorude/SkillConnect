package com.skillconnect.repository;

import com.skillconnect.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByRevieweeIdOrderByCreatedAtDesc(Long revieweeId, Pageable pageable);
    Page<Review> findByReviewerIdOrderByCreatedAtDesc(Long reviewerId, Pageable pageable);
    boolean existsByContractIdAndReviewerId(Long contractId, Long reviewerId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.reviewee.id = :userId")
    Double calculateAverageRating(@Param("userId") Long userId);

    long countByRevieweeId(Long revieweeId);
}
