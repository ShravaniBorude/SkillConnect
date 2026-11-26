package com.skillconnect.dto.review;

import com.skillconnect.entity.Review;
import java.time.Instant;

public record ReviewDto(
        Long id,
        Long contractId,
        Long reviewerId,
        String reviewerName,
        String reviewerAvatar,
        Long revieweeId,
        String revieweeName,
        Integer rating,
        String comment,
        Instant createdAt
) {
    public static ReviewDto from(Review r) {
        return new ReviewDto(
                r.getId(),
                r.getContract().getId(),
                r.getReviewer().getId(),
                r.getReviewer().getFullName(),
                r.getReviewer().getAvatarUrl(),
                r.getReviewee().getId(),
                r.getReviewee().getFullName(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt()
        );
    }
}
