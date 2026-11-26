package com.skillconnect.dto.contract;

import com.skillconnect.entity.Contract;
import com.skillconnect.entity.Milestone;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record ContractDto(
        Long id,
        Long projectId,
        String projectTitle,
        Long proposalId,
        Long clientId,
        String clientName,
        String clientAvatarUrl,
        Long freelancerId,
        String freelancerName,
        String freelancerAvatarUrl,
        String title,
        String terms,
        BigDecimal agreedAmount,
        BigDecimal platformFeePercent,
        LocalDate startDate,
        LocalDate dueDate,
        String status,
        Instant clientSignedAt,
        Instant freelancerSignedAt,
        Instant completedAt,
        List<MilestoneDto> milestones,
        Instant createdAt
) {
    public record MilestoneDto(Long id, String title, String description, BigDecimal amount,
                               LocalDate dueDate, Integer sequenceOrder, String status) {}

    public static ContractDto from(Contract c) {
        return new ContractDto(
                c.getId(),
                c.getProject().getId(),
                c.getProject().getTitle(),
                c.getProposal().getId(),
                c.getClient().getId(),
                c.getClient().getFullName(),
                c.getClient().getAvatarUrl(),
                c.getFreelancer().getId(),
                c.getFreelancer().getFullName(),
                c.getFreelancer().getAvatarUrl(),
                c.getTitle(),
                c.getTerms(),
                c.getAgreedAmount(),
                c.getPlatformFeePercent(),
                c.getStartDate(),
                c.getDueDate(),
                c.getStatus().name(),
                c.getClientSignedAt(),
                c.getFreelancerSignedAt(),
                c.getCompletedAt(),
                c.getMilestones().stream().map(m -> new MilestoneDto(
                        m.getId(), m.getTitle(), m.getDescription(),
                        m.getAmount(), m.getDueDate(), m.getSequenceOrder(), m.getStatus().name()
                )).toList(),
                c.getCreatedAt()
        );
    }
}
