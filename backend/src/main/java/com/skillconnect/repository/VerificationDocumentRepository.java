package com.skillconnect.repository;

import com.skillconnect.entity.VerificationDocument;
import com.skillconnect.entity.enums.DocumentReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VerificationDocumentRepository extends JpaRepository<VerificationDocument, Long> {
    List<VerificationDocument> findByFreelancerProfileIdOrderByCreatedAtDesc(Long freelancerProfileId);
    Page<VerificationDocument> findByStatusOrderByCreatedAtDesc(DocumentReviewStatus status, Pageable pageable);
    Page<VerificationDocument> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(DocumentReviewStatus status);
}
