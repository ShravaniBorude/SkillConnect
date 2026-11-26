package com.skillconnect.dto.profile;

import com.skillconnect.entity.PortfolioItem;
import com.skillconnect.entity.FreelancerProfile;
import com.skillconnect.entity.FreelancerSkill;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record FreelancerProfileDto(
        Long id,
        Long userId,
        String fullName,
        String email,
        String avatarUrl,
        String headline,
        String bio,
        BigDecimal hourlyRate,
        String experienceLevel,
        Integer yearsOfExperience,
        String education,
        String experienceSummary,
        String location,
        String languages,
        String availabilityStatus,
        String verificationStatus,
        BigDecimal averageRating,
        Integer totalReviews,
        BigDecimal totalEarnings,
        Integer completedProjectsCount,
        List<SkillDto> skills,
        List<PortfolioDto> portfolio,
        Instant createdAt
) {
    public record SkillDto(Long skillId, String skillName, String slug, String proficiencyLevel, Integer yearsUsed) {}
    public record PortfolioDto(Long id, String title, String description, String projectUrl, String imageUrl,
                               String attachmentUrl, String technologiesUsed, LocalDate completionDate, Instant createdAt) {}

    public static FreelancerProfileDto from(FreelancerProfile fp) {
        return new FreelancerProfileDto(
                fp.getId(),
                fp.getUser().getId(),
                fp.getUser().getFullName(),
                fp.getUser().getEmail(),
                fp.getUser().getAvatarUrl(),
                fp.getHeadline(),
                fp.getBio(),
                fp.getHourlyRate(),
                fp.getExperienceLevel().name(),
                fp.getYearsOfExperience(),
                fp.getEducation(),
                fp.getExperienceSummary(),
                fp.getLocation(),
                fp.getLanguages(),
                fp.getAvailabilityStatus().name(),
                fp.getVerificationStatus().name(),
                fp.getAverageRating(),
                fp.getTotalReviews(),
                fp.getTotalEarnings(),
                fp.getCompletedProjectsCount(),
                fp.getSkills().stream().map(fs -> new SkillDto(
                        fs.getSkill().getId(),
                        fs.getSkill().getName(),
                        fs.getSkill().getSlug(),
                        fs.getProficiencyLevel(),
                        fs.getYearsUsed()
                )).toList(),
                fp.getPortfolioItems().stream().map(pi -> new PortfolioDto(
                        pi.getId(),
                        pi.getTitle(),
                        pi.getDescription(),
                        pi.getProjectUrl(),
                        pi.getImageUrl(),
                        pi.getAttachmentUrl(),
                        pi.getTechnologiesUsed(),
                        pi.getCompletionDate(),
                        pi.getCreatedAt()
                )).toList(),
                fp.getCreatedAt()
        );
    }
}
