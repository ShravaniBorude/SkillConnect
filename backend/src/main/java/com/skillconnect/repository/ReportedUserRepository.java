package com.skillconnect.repository;

import com.skillconnect.entity.ReportedUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportedUserRepository extends JpaRepository<ReportedUser, Long> {
    Page<ReportedUser> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    Page<ReportedUser> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
