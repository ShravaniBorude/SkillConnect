package com.skillconnect.repository;

import com.skillconnect.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Transaction> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
