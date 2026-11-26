package com.skillconnect.dto.payment;

import com.skillconnect.entity.Payment;
import java.math.BigDecimal;
import java.time.Instant;

public record PaymentDto(
        Long id,
        Long contractId,
        Long milestoneId,
        Long payerId,
        String payerName,
        Long payeeId,
        String payeeName,
        BigDecimal amount,
        BigDecimal platformFee,
        BigDecimal netAmount,
        String currency,
        String razorpayOrderId,
        String razorpayPaymentId,
        String status,
        String receiptNumber,
        Instant paidAt,
        Instant createdAt
) {
    public static PaymentDto from(Payment p) {
        return new PaymentDto(
                p.getId(),
                p.getContract().getId(),
                p.getMilestone() != null ? p.getMilestone().getId() : null,
                p.getPayer().getId(),
                p.getPayer().getFullName(),
                p.getPayee().getId(),
                p.getPayee().getFullName(),
                p.getAmount(),
                p.getPlatformFee(),
                p.getNetAmount(),
                p.getCurrency(),
                p.getRazorpayOrderId(),
                p.getRazorpayPaymentId(),
                p.getStatus().name(),
                p.getReceiptNumber(),
                p.getPaidAt(),
                p.getCreatedAt()
        );
    }
}
