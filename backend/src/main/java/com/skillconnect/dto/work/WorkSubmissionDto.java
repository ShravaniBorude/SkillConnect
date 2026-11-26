package com.skillconnect.dto.work;

import com.skillconnect.entity.WorkSubmission;
import java.time.Instant;

public record WorkSubmissionDto(
        Long id,
        Long contractId,
        Long milestoneId,
        Long freelancerId,
        String freelancerName,
        String title,
        String description,
        String deliverableUrl,
        String deliverableName,
        String status,
        String revisionFeedback,
        Integer revisionNumber,
        Instant reviewedAt,
        Instant createdAt
) {
    public static WorkSubmissionDto from(WorkSubmission ws) {
        return new WorkSubmissionDto(
                ws.getId(),
                ws.getContract().getId(),
                ws.getMilestone() != null ? ws.getMilestone().getId() : null,
                ws.getFreelancer().getId(),
                ws.getFreelancer().getFullName(),
                ws.getTitle(),
                ws.getDescription(),
                ws.getDeliverableUrl(),
                ws.getDeliverableName(),
                ws.getStatus().name(),
                ws.getRevisionFeedback(),
                ws.getRevisionNumber(),
                ws.getReviewedAt(),
                ws.getCreatedAt()
        );
    }
}
