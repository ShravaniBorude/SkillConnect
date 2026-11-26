package com.skillconnect.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileBasicRequest(
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 120)
        String fullName,

        @Size(max = 30)
        String phone,

        @Size(max = 500)
        String avatarUrl
) {}
