package com.skillconnect.dto.project;

import com.skillconnect.entity.Project;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record ProjectDto(
        Long id,
        Long clientId,
        String clientName,
        String clientAvatarUrl,
        Long categoryId,
        String categoryName,
        String title,
        String description,
        String budgetType,
        BigDecimal budgetMin,
        BigDecimal budgetMax,
        String experienceLevel,
        LocalDate deadline,
        String status,
        Integer proposalCount,
        List<SkillRef> requiredSkills,
        List<AttachmentRef> attachments,
        Instant createdAt
) {
    public record SkillRef(Long id, String name, String slug) {}
    public record AttachmentRef(Long id, String fileName, String fileUrl, String fileType, Long fileSize) {}

    public static ProjectDto from(Project p) {
        return new ProjectDto(
                p.getId(),
                p.getClient().getId(),
                p.getClient().getFullName(),
                p.getClient().getAvatarUrl(),
                p.getCategory().getId(),
                p.getCategory().getName(),
                p.getTitle(),
                p.getDescription(),
                p.getBudgetType().name(),
                p.getBudgetMin(),
                p.getBudgetMax(),
                p.getExperienceLevel().name(),
                p.getDeadline(),
                p.getStatus().name(),
                p.getProposalCount(),
                p.getRequiredSkills().stream()
                        .map(s -> new SkillRef(s.getId(), s.getName(), s.getSlug()))
                        .toList(),
                p.getAttachments().stream()
                        .map(a -> new AttachmentRef(a.getId(), a.getFileName(), a.getFileUrl(), a.getFileType(), a.getFileSize()))
                        .toList(),
                p.getCreatedAt()
        );
    }
}
