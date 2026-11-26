package com.skillconnect.service;

import com.skillconnect.dto.common.PageResponse;
import com.skillconnect.dto.project.CreateProjectRequest;
import com.skillconnect.dto.project.ProjectDto;
import com.skillconnect.entity.*;
import com.skillconnect.entity.enums.ExperienceLevel;
import com.skillconnect.entity.enums.ProjectStatus;
import com.skillconnect.exception.*;
import com.skillconnect.repository.*;
import com.skillconnect.security.SecurityUtils;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectCategoryRepository categoryRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;
    private final FreelancerProfileRepository freelancerProfileRepository;

    public ProjectService(ProjectRepository projectRepository,
                          ProjectCategoryRepository categoryRepository,
                          SkillRepository skillRepository,
                          UserRepository userRepository,
                          FreelancerProfileRepository freelancerProfileRepository) {
        this.projectRepository = projectRepository;
        this.categoryRepository = categoryRepository;
        this.skillRepository = skillRepository;
        this.userRepository = userRepository;
        this.freelancerProfileRepository = freelancerProfileRepository;
    }

    @Transactional
    public ProjectDto createProject(CreateProjectRequest request) {
        Long clientId = SecurityUtils.getCurrentUserId();
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
        ProjectCategory category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.categoryId()));

        if (request.budgetMin().compareTo(request.budgetMax()) > 0) {
            throw new BadRequestException("Minimum budget cannot exceed maximum budget");
        }

        Project project = new Project();
        project.setClient(client);
        project.setCategory(category);
        project.setTitle(request.title());
        project.setDescription(request.description());
        project.setBudgetType(request.budgetType());
        project.setBudgetMin(request.budgetMin());
        project.setBudgetMax(request.budgetMax());
        project.setExperienceLevel(request.experienceLevel() != null ? request.experienceLevel() : ExperienceLevel.INTERMEDIATE);
        project.setDeadline(request.deadline());
        project.setStatus(ProjectStatus.OPEN);

        if (request.requiredSkillIds() != null && !request.requiredSkillIds().isEmpty()) {
            project.setRequiredSkills(new HashSet<>(skillRepository.findByIdIn(request.requiredSkillIds())));
        }

        Project saved = projectRepository.save(project);
        return ProjectDto.from(saved);
    }

    @Transactional(readOnly = true)
    public ProjectDto getProjectById(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));
        return ProjectDto.from(project);
    }

    @Transactional
    public ProjectDto updateProject(Long projectId, CreateProjectRequest request) {
        Long clientId = SecurityUtils.getCurrentUserId();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));
        if (!project.getClient().getId().equals(clientId)) {
            throw new ForbiddenException("You can only edit your own projects");
        }
        if (project.getStatus() != ProjectStatus.OPEN) {
            throw new BadRequestException("Only OPEN projects can be edited");
        }

        ProjectCategory category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.categoryId()));
        project.setCategory(category);
        project.setTitle(request.title());
        project.setDescription(request.description());
        project.setBudgetType(request.budgetType());
        project.setBudgetMin(request.budgetMin());
        project.setBudgetMax(request.budgetMax());
        if (request.experienceLevel() != null) project.setExperienceLevel(request.experienceLevel());
        project.setDeadline(request.deadline());
        if (request.requiredSkillIds() != null) {
            project.setRequiredSkills(new HashSet<>(skillRepository.findByIdIn(request.requiredSkillIds())));
        }
        return ProjectDto.from(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Long projectId) {
        Long clientId = SecurityUtils.getCurrentUserId();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));
        if (!project.getClient().getId().equals(clientId)) {
            throw new ForbiddenException("You can only delete your own projects");
        }
        if (project.getStatus() != ProjectStatus.OPEN) {
            throw new BadRequestException("Only OPEN projects can be deleted");
        }
        project.setStatus(ProjectStatus.CANCELLED);
        projectRepository.save(project);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProjectDto> browseProjects(String keyword, Long categoryId, String budgetType,
                                                     Double budgetMin, Double budgetMax, String experienceLevel,
                                                     List<Long> skillIds, int page, int size, String sortBy) {
        Sort sort = "oldest".equals(sortBy) ? Sort.by("createdAt").ascending()
                : Sort.by("createdAt").descending();
        Pageable pageable = PageRequest.of(page, Math.min(size, 50), sort);

        Page<Project> projects = projectRepository.findAll(pageable);
        return PageResponse.from(projects, ProjectDto::from);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProjectDto> getMyProjects(int page, int size) {
        Long clientId = SecurityUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);
        return PageResponse.from(projectRepository.findByClientIdOrderByCreatedAtDesc(clientId, pageable), ProjectDto::from);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProjectDto> getRecommendedProjects(int page, int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        return freelancerProfileRepository.findByUserId(userId).map(fp -> {
            var skillIds = fp.getSkills().stream().map(fs -> fs.getSkill().getId()).toList();
            Pageable pageable = PageRequest.of(page, size);
            if (skillIds.isEmpty()) {
                return PageResponse.from(projectRepository.findAll(pageable), ProjectDto::from);
            }
            return PageResponse.from(projectRepository.findRecommendedBySkillIds(skillIds, pageable), ProjectDto::from);
        }).orElse(PageResponse.from(Page.empty(), ProjectDto::from));
    }
}
