package com.skillconnect.dto.profile;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PortfolioItemRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 180)
        String title,

        @NotBlank(message = "Description is required")
        @Size(max = 3000)
        String description,

        @Size(max = 500)
        String projectUrl,

        @Size(max = 500)
        String imageUrl,

        @Size(max = 500)
        String attachmentUrl,

        @Size(max = 400)
        String technologiesUsed,

        LocalDate completionDate
) {}
