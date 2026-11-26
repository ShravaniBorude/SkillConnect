package com.skillconnect.dto.profile;

import com.skillconnect.entity.enums.AvailabilityStatus;
import com.skillconnect.entity.enums.ExperienceLevel;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record UpdateFreelancerProfileRequest(
        @Size(max = 200, message = "Headline cannot exceed 200 characters")
        String headline,

        @Size(max = 3000, message = "Bio cannot exceed 3000 characters")
        String bio,

        @DecimalMin(value = "0.0", message = "Hourly rate cannot be negative")
        @DecimalMax(value = "10000.0", message = "Hourly rate cannot exceed 10000")
        BigDecimal hourlyRate,

        ExperienceLevel experienceLevel,

        @Min(value = 0, message = "Years of experience cannot be negative")
        @Max(value = 50, message = "Years of experience cannot exceed 50")
        Integer yearsOfExperience,

        @Size(max = 2000)
        String education,

        @Size(max = 3000)
        String experienceSummary,

        @Size(max = 120)
        String location,

        @Size(max = 255)
        String languages,

        AvailabilityStatus availabilityStatus
) {}
