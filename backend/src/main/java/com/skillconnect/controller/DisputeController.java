package com.skillconnect.controller;

import com.skillconnect.dto.common.ApiResponse;
import com.skillconnect.entity.Dispute;
import com.skillconnect.entity.ReportedUser;
import com.skillconnect.entity.VerificationDocument;
import com.skillconnect.entity.enums.DisputeStatus;
import com.skillconnect.entity.enums.DocumentType;
import com.skillconnect.exception.BadRequestException;
import com.skillconnect.exception.ForbiddenException;
import com.skillconnect.exception.ResourceNotFoundException;
import com.skillconnect.repository.*;
import com.skillconnect.security.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DisputeController {

    private final DisputeRepository disputeRepository;
    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final ReportedUserRepository reportedUserRepository;
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final VerificationDocumentRepository verificationDocumentRepository;

    public DisputeController(DisputeRepository disputeRepository,
                              ContractRepository contractRepository,
                              UserRepository userRepository,
                              ReportedUserRepository reportedUserRepository,
                              FreelancerProfileRepository freelancerProfileRepository,
                              VerificationDocumentRepository verificationDocumentRepository) {
        this.disputeRepository = disputeRepository;
        this.contractRepository = contractRepository;
        this.userRepository = userRepository;
        this.reportedUserRepository = reportedUserRepository;
        this.freelancerProfileRepository = freelancerProfileRepository;
        this.verificationDocumentRepository = verificationDocumentRepository;
    }

    @PostMapping("/disputes")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Dispute>> raiseDispute(@RequestBody Map<String, Object> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        Long contractId = Long.valueOf(body.get("contractId").toString());
        Long againstUserId = Long.valueOf(body.get("againstUserId").toString());

        var contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found"));
        if (!contract.getClient().getId().equals(userId) && !contract.getFreelancer().getId().equals(userId)) {
            throw new ForbiddenException("Not your contract");
        }
        var raisedBy = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var againstUser = userRepository.findById(againstUserId).orElseThrow(() -> new ResourceNotFoundException("Against user not found"));

        Dispute dispute = new Dispute();
        dispute.setContract(contract);
        dispute.setRaisedBy(raisedBy);
        dispute.setAgainstUser(againstUser);
        dispute.setReason(body.getOrDefault("reason", "").toString());
        dispute.setDescription(body.getOrDefault("description", "").toString());
        dispute.setEvidenceUrl(body.getOrDefault("evidenceUrl", "").toString());
        dispute.setStatus(DisputeStatus.OPEN);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Dispute raised", disputeRepository.save(dispute)));
    }

    @PostMapping("/reports")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReportedUser>> reportUser(@RequestBody Map<String, Object> body) {
        Long reporterId = SecurityUtils.getCurrentUserId();
        Long reportedUserId = Long.valueOf(body.get("reportedUserId").toString());

        var reporter = userRepository.findById(reporterId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var reported = userRepository.findById(reportedUserId).orElseThrow(() -> new ResourceNotFoundException("Reported user not found"));

        ReportedUser report = new ReportedUser();
        report.setReporter(reporter);
        report.setReportedUser(reported);
        report.setReason(body.getOrDefault("reason", "").toString());
        report.setDetails(body.getOrDefault("details", "").toString());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Report submitted", reportedUserRepository.save(report)));
    }

    @PostMapping("/freelancer/verification-documents")
    @PreAuthorize("hasRole('ROLE_FREELANCER')")
    public ResponseEntity<ApiResponse<VerificationDocument>> uploadDocument(@RequestBody Map<String, String> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        var fp = freelancerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer profile not found"));

        VerificationDocument doc = new VerificationDocument();
        doc.setFreelancerProfile(fp);
        doc.setDocumentType(DocumentType.valueOf(body.getOrDefault("documentType", "OTHER")));
        doc.setDocumentUrl(body.get("documentUrl"));
        doc.setDocumentNumberMasked(body.get("documentNumberMasked"));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Document uploaded for review", verificationDocumentRepository.save(doc)));
    }

    @GetMapping("/freelancer/verification-documents")
    @PreAuthorize("hasRole('ROLE_FREELANCER')")
    public ResponseEntity<ApiResponse<?>> getMyDocuments() {
        Long userId = SecurityUtils.getCurrentUserId();
        var fp = freelancerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer profile not found"));
        return ResponseEntity.ok(ApiResponse.ok(verificationDocumentRepository.findByFreelancerProfileIdOrderByCreatedAtDesc(fp.getId())));
    }
}
