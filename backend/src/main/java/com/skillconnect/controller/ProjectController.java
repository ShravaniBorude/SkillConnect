package com.skillconnect.controller;

import com.skillconnect.dto.common.ApiResponse;
import com.skillconnect.dto.common.PageResponse;
import com.skillconnect.dto.project.CreateProjectRequest;
import com.skillconnect.dto.project.ProjectDto;
import com.skillconnect.entity.ProjectCategory;
import com.skillconnect.repository.ProjectCategoryRepository;
import com.skillconnect.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectCategoryRepository categoryRepository;

    public ProjectController(ProjectService projectService, ProjectCategoryRepository categoryRepository) {
        this.projectService = projectService;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<ProjectCategory>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(categoryRepository.findByActiveTrueOrderByNameAsc()));
    }

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<PageResponse<ProjectDto>>> browse(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String budgetType,
            @RequestParam(required = false) Double budgetMin,
            @RequestParam(required = false) Double budgetMax,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(required = false) List<Long> skillIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "latest") String sortBy) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.browseProjects(
                keyword, categoryId, budgetType, budgetMin, budgetMax, experienceLevel, skillIds, page, size, sortBy)));
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<ApiResponse<ProjectDto>> getById(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.getProjectById(projectId)));
    }

    @PostMapping("/client/projects")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<ApiResponse<ProjectDto>> create(@Valid @RequestBody CreateProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Project posted successfully", projectService.createProject(request)));
    }

    @GetMapping("/client/projects")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<ApiResponse<PageResponse<ProjectDto>>> myProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.getMyProjects(page, size)));
    }

    @PutMapping("/client/projects/{projectId}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<ApiResponse<ProjectDto>> update(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateProjectRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Project updated", projectService.updateProject(projectId, request)));
    }

    @DeleteMapping("/client/projects/{projectId}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.ok(ApiResponse.ok("Project cancelled", null));
    }

    @GetMapping("/freelancer/recommended-projects")
    @PreAuthorize("hasRole('ROLE_FREELANCER')")
    public ResponseEntity<ApiResponse<PageResponse<ProjectDto>>> recommended(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.getRecommendedProjects(page, size)));
    }
}
