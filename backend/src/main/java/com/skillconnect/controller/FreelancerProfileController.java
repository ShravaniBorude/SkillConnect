package com.skillconnect.controller;

import com.skillconnect.dto.common.ApiResponse;
import com.skillconnect.dto.common.PageResponse;
import com.skillconnect.dto.profile.*;
import com.skillconnect.entity.Skill;
import com.skillconnect.repository.SkillRepository;
import com.skillconnect.service.FreelancerProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FreelancerProfileController {

    private final FreelancerProfileService profileService;
    private final SkillRepository skillRepository;

    public FreelancerProfileController(FreelancerProfileService profileService, SkillRepository skillRepository) {
        this.profileService = profileService;
        this.skillRepository = skillRepository;
    }

    // Public endpoints
    @GetMapping("/freelancers")
    public ResponseEntity<ApiResponse<PageResponse<FreelancerProfileDto>>> browse(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "") String category,
            @RequestParam(defaultValue = "") String experienceLevel,
            @RequestParam(defaultValue = "") String availability,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "rating") String sortBy) {
        var result = profileService.browseFreelancers(keyword, category, experienceLevel, availability, page, size, sortBy);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(result, fp -> fp)));
    }

    @GetMapping("/freelancers/{userId}")
    public ResponseEntity<ApiResponse<FreelancerProfileDto>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getProfileByUserId(userId)));
    }

    @GetMapping("/skills")
    public ResponseEntity<ApiResponse<List<Skill>>> getAllSkills() {
        return ResponseEntity.ok(ApiResponse.ok(skillRepository.findAllByOrderByNameAsc()));
    }

    // Freelancer-only endpoints
    @GetMapping("/freelancer/profile")
    @PreAuthorize("hasRole('ROLE_FREELANCER')")
    public ResponseEntity<ApiResponse<FreelancerProfileDto>> getMyProfile() {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getMyProfile()));
    }

    @PutMapping("/freelancer/profile")
    @PreAuthorize("hasRole('ROLE_FREELANCER')")
    public ResponseEntity<ApiResponse<FreelancerProfileDto>> updateProfile(
            @Valid @RequestBody UpdateFreelancerProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", profileService.updateProfile(request)));
    }

    @PostMapping("/freelancer/skills")
    @PreAuthorize("hasRole('ROLE_FREELANCER')")
    public ResponseEntity<ApiResponse<FreelancerProfileDto>> addSkill(@Valid @RequestBody AddSkillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Skill added", profileService.addSkill(request)));
    }

    @DeleteMapping("/freelancer/skills/{skillId}")
    @PreAuthorize("hasRole('ROLE_FREELANCER')")
    public ResponseEntity<ApiResponse<Void>> removeSkill(@PathVariable Long skillId) {
        profileService.removeSkill(skillId);
        return ResponseEntity.ok(ApiResponse.ok("Skill removed", null));
    }

    @PostMapping("/freelancer/portfolio")
    @PreAuthorize("hasRole('ROLE_FREELANCER')")
    public ResponseEntity<ApiResponse<FreelancerProfileDto.PortfolioDto>> addPortfolio(
            @Valid @RequestBody PortfolioItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Portfolio item added", profileService.addPortfolioItem(request)));
    }

    @PutMapping("/freelancer/portfolio/{itemId}")
    @PreAuthorize("hasRole('ROLE_FREELANCER')")
    public ResponseEntity<ApiResponse<FreelancerProfileDto.PortfolioDto>> updatePortfolio(
            @PathVariable Long itemId,
            @Valid @RequestBody PortfolioItemRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Portfolio item updated", profileService.updatePortfolioItem(itemId, request)));
    }

    @DeleteMapping("/freelancer/portfolio/{itemId}")
    @PreAuthorize("hasRole('ROLE_FREELANCER')")
    public ResponseEntity<ApiResponse<Void>> deletePortfolio(@PathVariable Long itemId) {
        profileService.deletePortfolioItem(itemId);
        return ResponseEntity.ok(ApiResponse.ok("Portfolio item deleted", null));
    }
}
