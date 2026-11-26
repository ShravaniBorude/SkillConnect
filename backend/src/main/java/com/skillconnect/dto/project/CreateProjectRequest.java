package com.skillconnect.dto.project;

import com.skillconnect.entity.enums.BudgetType;
import com.skillconnect.entity.enums.ExperienceLevel;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateProjectRequest(
        @NotBlank(message = "Title is required")
        @Size(min = 10, max = 200, message = "Title must be between 10 and 200 characters")
        String title,

        @NotBlank(message = "Description is required")
        @Size(min = 50, max = 10000, message = "Description must be at least 50 characters")
        String description,

        @NotNull(message = "Category is required")
        Long categoryId,

        @NotNull(message = "Budget type is required")
        BudgetType budgetType,

        @NotNull(message = "Minimum budget is required")
        @DecimalMin(value = "1.0", message = "Budget must be greater than 0")
        BigDecimal budgetMin,

        @NotNull(message = "Maximum budget is required")
        @DecimalMin(value = "1.0")
        BigDecimal budgetMax,

        ExperienceLevel experienceLevel,

        @NotNull(message = "Deadline is required")
        @Future(message = "Deadline must be in the future")
        LocalDate deadline,

        @Size(max = 20, message = "Maximum 20 skills allowed")
        List<Long> requiredSkillIds
) {}
