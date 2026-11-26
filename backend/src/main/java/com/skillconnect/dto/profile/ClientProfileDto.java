package com.skillconnect.dto.profile;

import com.skillconnect.entity.ClientProfile;

import java.math.BigDecimal;
import java.time.Instant;

public record ClientProfileDto(
        Long id,
        Long userId,
        String fullName,
        String email,
        String avatarUrl,
        String companyName,
        String industry,
        String website,
        String bio,
        String location,
        BigDecimal averageRating,
        Integer totalReviews,
        BigDecimal totalSpent,
        Integer projectsPostedCount,
        Instant createdAt
) {
    public static ClientProfileDto from(ClientProfile cp) {
        return new ClientProfileDto(
                cp.getId(),
                cp.getUser().getId(),
                cp.getUser().getFullName(),
                cp.getUser().getEmail(),
                cp.getUser().getAvatarUrl(),
                cp.getCompanyName(),
                cp.getIndustry(),
                cp.getWebsite(),
                cp.getBio(),
                cp.getLocation(),
                cp.getAverageRating(),
                cp.getTotalReviews(),
                cp.getTotalSpent(),
                cp.getProjectsPostedCount(),
                cp.getCreatedAt()
        );
    }
}
