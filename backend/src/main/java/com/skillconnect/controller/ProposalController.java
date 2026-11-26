package com.skillconnect.controller;

import com.skillconnect.dto.common.ApiResponse;
import com.skillconnect.dto.common.PageResponse;
import com.skillconnect.dto.proposal.ProposalDto;
import com.skillconnect.dto.proposal.SubmitProposalRequest;
import com.skillconnect.service.ProposalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProposalController {

    private final ProposalService proposalService;

    public ProposalController(ProposalService proposalService) {
        this.proposalService = proposalService;
    }

    @PostMapping("/freelancer/proposals")
    @PreAuthorize("hasRole('ROLE_FREELANCER')")
    public ResponseEntity<ApiResponse<ProposalDto>> submit(@Valid @RequestBody SubmitProposalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Proposal submitted", proposalService.submitProposal(request)));
    }

    @DeleteMapping("/freelancer/proposals/{proposalId}")
    @PreAuthorize("hasRole('ROLE_FREELANCER')")
    public ResponseEntity<ApiResponse<Void>> withdraw(@PathVariable Long proposalId) {
        proposalService.withdrawProposal(proposalId);
        return ResponseEntity.ok(ApiResponse.ok("Proposal withdrawn", null));
    }

    @GetMapping("/freelancer/proposals")
    @PreAuthorize("hasRole('ROLE_FREELANCER')")
    public ResponseEntity<ApiResponse<PageResponse<ProposalDto>>> myProposals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(proposalService.getMyProposals(page, size)));
    }

    @GetMapping("/client/projects/{projectId}/proposals")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<ApiResponse<List<ProposalDto>>> projectProposals(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.ok(proposalService.getProjectProposals(projectId)));
    }

    @PatchMapping("/client/proposals/{proposalId}/shortlist")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<ApiResponse<ProposalDto>> shortlist(@PathVariable Long proposalId) {
        return ResponseEntity.ok(ApiResponse.ok("Proposal shortlisted", proposalService.shortlistProposal(proposalId)));
    }

    @PatchMapping("/client/proposals/{proposalId}/reject")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<ApiResponse<ProposalDto>> reject(@PathVariable Long proposalId) {
        return ResponseEntity.ok(ApiResponse.ok("Proposal rejected", proposalService.rejectProposal(proposalId)));
    }
}
