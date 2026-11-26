package com.skillconnect.service;

import com.skillconnect.dto.profile.*;
import com.skillconnect.entity.*;
import com.skillconnect.exception.*;
import com.skillconnect.repository.*;
import com.skillconnect.security.SecurityUtils;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FreelancerProfileService {

    private final FreelancerProfileRepository profileRepository;
    private final SkillRepository skillRepository;
    private final FreelancerSkillRepository freelancerSkillRepository;
    private final PortfolioItemRepository portfolioItemRepository;
    private final UserRepository userRepository;

    public FreelancerProfileService(FreelancerProfileRepository profileRepository,
                                    SkillRepository skillRepository,
                                    FreelancerSkillRepository freelancerSkillRepository,
                                    PortfolioItemRepository portfolioItemRepository,
                                    UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.skillRepository = skillRepository;
        this.freelancerSkillRepository = freelancerSkillRepository;
        this.portfolioItemRepository = portfolioItemRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public FreelancerProfileDto getMyProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        FreelancerProfile fp = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer profile not found"));
        return FreelancerProfileDto.from(fp);
    }

    @Transactional(readOnly = true)
    public FreelancerProfileDto getProfileByUserId(Long userId) {
        FreelancerProfile fp = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer profile not found for user: " + userId));
        return FreelancerProfileDto.from(fp);
    }

    @Transactional(readOnly = true)
    public FreelancerProfileDto getProfileById(Long profileId) {
        FreelancerProfile fp = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer profile not found: " + profileId));
        return FreelancerProfileDto.from(fp);
    }

    @Transactional
    public FreelancerProfileDto updateProfile(UpdateFreelancerProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        FreelancerProfile fp = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer profile not found"));

        if (request.headline() != null) fp.setHeadline(request.headline());
        if (request.bio() != null) fp.setBio(request.bio());
        if (request.hourlyRate() != null) fp.setHourlyRate(request.hourlyRate());
        if (request.experienceLevel() != null) fp.setExperienceLevel(request.experienceLevel());
        if (request.yearsOfExperience() != null) fp.setYearsOfExperience(request.yearsOfExperience());
        if (request.education() != null) fp.setEducation(request.education());
        if (request.experienceSummary() != null) fp.setExperienceSummary(request.experienceSummary());
        if (request.location() != null) fp.setLocation(request.location());
        if (request.languages() != null) fp.setLanguages(request.languages());
        if (request.availabilityStatus() != null) fp.setAvailabilityStatus(request.availabilityStatus());

        return FreelancerProfileDto.from(profileRepository.save(fp));
    }

    @Transactional
    public FreelancerProfileDto addSkill(AddSkillRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        FreelancerProfile fp = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer profile not found"));
        Skill skill = skillRepository.findById(request.skillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + request.skillId()));

        if (freelancerSkillRepository.findByFreelancerProfileIdAndSkillId(fp.getId(), skill.getId()).isPresent()) {
            throw new ConflictException("Skill already added to your profile");
        }

        FreelancerSkill fs = new FreelancerSkill();
        fs.setFreelancerProfile(fp);
        fs.setSkill(skill);
        fs.setProficiencyLevel(request.proficiencyLevel());
        fs.setYearsUsed(request.yearsUsed() != null ? request.yearsUsed() : 1);
        freelancerSkillRepository.save(fs);

        return FreelancerProfileDto.from(profileRepository.findByUserId(userId).get());
    }

    @Transactional
    public void removeSkill(Long skillId) {
        Long userId = SecurityUtils.getCurrentUserId();
        FreelancerProfile fp = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer profile not found"));
        freelancerSkillRepository.deleteByFreelancerProfileIdAndSkillId(fp.getId(), skillId);
    }

    @Transactional
    public FreelancerProfileDto.PortfolioDto addPortfolioItem(PortfolioItemRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        FreelancerProfile fp = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer profile not found"));

        PortfolioItem item = new PortfolioItem();
        item.setFreelancerProfile(fp);
        item.setTitle(request.title());
        item.setDescription(request.description());
        item.setProjectUrl(request.projectUrl());
        item.setImageUrl(request.imageUrl());
        item.setAttachmentUrl(request.attachmentUrl());
        item.setTechnologiesUsed(request.technologiesUsed());
        item.setCompletionDate(request.completionDate());

        PortfolioItem saved = portfolioItemRepository.save(item);
        return new FreelancerProfileDto.PortfolioDto(saved.getId(), saved.getTitle(), saved.getDescription(),
                saved.getProjectUrl(), saved.getImageUrl(), saved.getAttachmentUrl(),
                saved.getTechnologiesUsed(), saved.getCompletionDate(), saved.getCreatedAt());
    }

    @Transactional
    public FreelancerProfileDto.PortfolioDto updatePortfolioItem(Long itemId, PortfolioItemRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        FreelancerProfile fp = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer profile not found"));
        PortfolioItem item = portfolioItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio item not found: " + itemId));
        if (!item.getFreelancerProfile().getId().equals(fp.getId())) {
            throw new ForbiddenException("Not your portfolio item");
        }

        item.setTitle(request.title());
        item.setDescription(request.description());
        item.setProjectUrl(request.projectUrl());
        item.setImageUrl(request.imageUrl());
        item.setAttachmentUrl(request.attachmentUrl());
        item.setTechnologiesUsed(request.technologiesUsed());
        item.setCompletionDate(request.completionDate());

        PortfolioItem saved = portfolioItemRepository.save(item);
        return new FreelancerProfileDto.PortfolioDto(saved.getId(), saved.getTitle(), saved.getDescription(),
                saved.getProjectUrl(), saved.getImageUrl(), saved.getAttachmentUrl(),
                saved.getTechnologiesUsed(), saved.getCompletionDate(), saved.getCreatedAt());
    }

    @Transactional
    public void deletePortfolioItem(Long itemId) {
        Long userId = SecurityUtils.getCurrentUserId();
        FreelancerProfile fp = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer profile not found"));
        PortfolioItem item = portfolioItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio item not found: " + itemId));
        if (!item.getFreelancerProfile().getId().equals(fp.getId())) {
            throw new ForbiddenException("Not your portfolio item");
        }
        portfolioItemRepository.delete(item);
    }

    @Transactional(readOnly = true)
    public Page<FreelancerProfileDto> browseFreelancers(String keyword, String category,
                                                         String experienceLevel, String availability,
                                                         int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC,
                "averageRating".equals(sortBy) ? "averageRating" : "createdAt"));
        // Simple keyword search; for advanced filtering use JPA Specifications
        return profileRepository.findAll(pageable).map(FreelancerProfileDto::from);
    }
}
