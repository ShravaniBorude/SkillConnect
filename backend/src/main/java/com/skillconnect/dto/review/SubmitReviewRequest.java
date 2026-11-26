package com.skillconnect.dto.review;

import jakarta.validation.constraints.*;

public record SubmitReviewRequest(
        @NotNull Long contractId,
        @NotNull Long revieweeId,
        @NotNull @Min(1) @Max(5) Integer rating,
        @NotBlank @Size(min = 10, max = 2000) String comment
) {}
