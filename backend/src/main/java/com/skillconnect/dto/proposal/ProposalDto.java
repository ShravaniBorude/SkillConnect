package com.skillconnect.dto.proposal;

import com.skillconnect.entity.Proposal;

import java.math.BigDecimal;
import java.time.Instant;

public record ProposalDto(
        Long id,
        Long projectId,
        String projectTitle,
        Long freelancerId,
        String freelancerName,
        String freelancerAvatarUrl,
        String coverLetter,
        BigDecimal proposedBudget,
        Integer estimatedDays,
        String status,
        String negotiationNotes,
        Instant createdAt
) {
    public static ProposalDto from(Proposal p) {
        return new ProposalDto(
                p.getId(),
                p.getProject().getId(),
                p.getProject().getTitle(),
                p.getFreelancer().getId(),
                p.getFreelancer().getFullName(),
                p.getFreelancer().getAvatarUrl(),
                p.getCoverLetter(),
                p.getProposedBudget(),
                p.getEstimatedDays(),
                p.getStatus().name(),
                p.getNegotiationNotes(),
                p.getCreatedAt()
        );
    }
}
