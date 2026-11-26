package com.skillconnect.dto.work;

import jakarta.validation.constraints.*;

public record SubmitWorkRequest(
        @NotNull Long contractId,
        Long milestoneId,
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 5000) String description,
        @NotBlank @Size(max = 500) String deliverableUrl,
        @Size(max = 255) String deliverableName
) {}
