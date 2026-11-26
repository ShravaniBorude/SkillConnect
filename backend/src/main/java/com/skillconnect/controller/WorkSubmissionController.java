package com.skillconnect.controller;

import com.skillconnect.dto.common.ApiResponse;
import com.skillconnect.dto.work.*;
import com.skillconnect.service.WorkSubmissionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class WorkSubmissionController {

    private final WorkSubmissionService workSubmissionService;

    public WorkSubmissionController(WorkSubmissionService workSubmissionService) {
        this.workSubmissionService = workSubmissionService;
    }

    @PostMapping("/freelancer/submissions")
    @PreAuthorize("hasRole('ROLE_FREELANCER')")
    public ResponseEntity<ApiResponse<WorkSubmissionDto>> submit(@Valid @RequestBody SubmitWorkRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Work submitted for review", workSubmissionService.submitWork(request)));
    }

    @GetMapping("/contracts/{contractId}/submissions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<WorkSubmissionDto>>> getSubmissions(@PathVariable Long contractId) {
        return ResponseEntity.ok(ApiResponse.ok(workSubmissionService.getContractSubmissions(contractId)));
    }

    @PatchMapping("/client/submissions/{submissionId}/approve")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<ApiResponse<WorkSubmissionDto>> approve(@PathVariable Long submissionId) {
        return ResponseEntity.ok(ApiResponse.ok("Work approved", workSubmissionService.approveWork(submissionId)));
    }

    @PatchMapping("/client/submissions/{submissionId}/request-revision")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<ApiResponse<WorkSubmissionDto>> requestRevision(
            @PathVariable Long submissionId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Revision requested",
                workSubmissionService.requestRevision(submissionId, body.get("feedback"))));
    }
}
