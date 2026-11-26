package com.skillconnect.dto.payment;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record CreatePaymentOrderRequest(
        @NotNull Long contractId,
        Long milestoneId,
        @NotNull @DecimalMin("1.0") BigDecimal amount,
        @NotBlank @Size(max = 10) String currency,
        @NotBlank @Size(max = 120) String idempotencyKey
) {}
