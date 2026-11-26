package com.skillconnect.dto.auth;

import java.time.Instant;

public record UserSummaryDto(
        Long id,
        String email,
        String fullName,
        String role,
        String avatarUrl,
        String phone,
        boolean emailVerified,
        String accountStatus,
        Instant createdAt
) {}
