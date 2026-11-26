package com.skillconnect.dto.contract;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateContractRequest(
        @NotNull Long proposalId,
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 10000) String terms,
        @NotNull LocalDate startDate,
        @NotNull LocalDate dueDate,
        @Valid List<MilestoneRequest> milestones
) {
    public record MilestoneRequest(
            @NotBlank @Size(max = 180) String title,
            @Size(max = 2000) String description,
            @NotNull @DecimalMin("0.01") BigDecimal amount,
            LocalDate dueDate,
            @Min(1) Integer sequenceOrder
    ) {}
}
