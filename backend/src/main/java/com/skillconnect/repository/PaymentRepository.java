package com.skillconnect.repository;

import com.skillconnect.entity.Payment;
import com.skillconnect.entity.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByIdempotencyKey(String idempotencyKey);
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    Page<Payment> findByPayerIdOrderByCreatedAtDesc(Long payerId, Pageable pageable);
    Page<Payment> findByPayeeIdOrderByCreatedAtDesc(Long payeeId, Pageable pageable);
    Page<Payment> findByContractIdOrderByCreatedAtDesc(Long contractId, Pageable pageable);
    Page<Payment> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'CAPTURED'")
    BigDecimal sumCapturedVolume();

    @Query("SELECT COALESCE(SUM(p.platformFee), 0) FROM Payment p WHERE p.status = 'CAPTURED'")
    BigDecimal sumCapturedPlatformFees();

    @Query("SELECT COALESCE(SUM(p.netAmount), 0) FROM Payment p WHERE p.payee.id = :freelancerId AND p.status = 'CAPTURED'")
    BigDecimal sumNetEarningsForFreelancer(@Param("freelancerId") Long freelancerId);
}
