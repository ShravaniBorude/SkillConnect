package com.skillconnect.dto.profile;

import jakarta.validation.constraints.*;

public record AddSkillRequest(
        @NotNull(message = "Skill ID is required")
        Long skillId,

        @NotBlank(message = "Proficiency level is required")
        @Pattern(regexp = "BEGINNER|INTERMEDIATE|EXPERT", message = "Must be BEGINNER, INTERMEDIATE or EXPERT")
        String proficiencyLevel,

        @Min(0) @Max(50)
        Integer yearsUsed
) {}
