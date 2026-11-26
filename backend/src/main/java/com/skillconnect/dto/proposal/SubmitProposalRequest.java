package com.skillconnect.dto.proposal;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record SubmitProposalRequest(
        @NotNull(message = "Project ID is required")
        Long projectId,

        @NotBlank(message = "Cover letter is required")
        @Size(min = 100, max = 5000, message = "Cover letter must be between 100 and 5000 characters")
        String coverLetter,

        @NotNull(message = "Proposed budget is required")
        @DecimalMin(value = "1.0", message = "Budget must be greater than 0")
        BigDecimal proposedBudget,

        @NotNull(message = "Estimated days is required")
        @Min(value = 1, message = "Estimated days must be at least 1")
        @Max(value = 365, message = "Estimated days cannot exceed 365")
        Integer estimatedDays,

        @Size(max = 2000)
        String negotiationNotes
) {}
