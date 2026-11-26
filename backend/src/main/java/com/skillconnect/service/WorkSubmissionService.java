package com.skillconnect.service;

import com.skillconnect.dto.work.*;
import com.skillconnect.entity.*;
import com.skillconnect.entity.enums.*;
import com.skillconnect.exception.*;
import com.skillconnect.repository.*;
import com.skillconnect.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class WorkSubmissionService {

    private final WorkSubmissionRepository submissionRepository;
    private final ContractRepository contractRepository;
    private final MilestoneRepository milestoneRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public WorkSubmissionService(WorkSubmissionRepository submissionRepository,
                                  ContractRepository contractRepository,
                                  MilestoneRepository milestoneRepository,
                                  UserRepository userRepository,
                                  NotificationService notificationService) {
        this.submissionRepository = submissionRepository;
        this.contractRepository = contractRepository;
        this.milestoneRepository = milestoneRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public WorkSubmissionDto submitWork(SubmitWorkRequest request) {
        Long freelancerId = SecurityUtils.getCurrentUserId();
        Contract contract = contractRepository.findById(request.contractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found: " + request.contractId()));

        if (!contract.getFreelancer().getId().equals(freelancerId)) {
            throw new ForbiddenException("Not your contract");
        }
        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new BadRequestException("Contract must be ACTIVE to submit work");
        }

        User freelancer = userRepository.findById(freelancerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        WorkSubmission submission = new WorkSubmission();
        submission.setContract(contract);
        submission.setFreelancer(freelancer);
        submission.setTitle(request.title());
        submission.setDescription(request.description());
        submission.setDeliverableUrl(request.deliverableUrl());
        submission.setDeliverableName(request.deliverableName());
        submission.setStatus(SubmissionStatus.SUBMITTED);
        submission.setRevisionNumber(1);

        if (request.milestoneId() != null) {
            milestoneRepository.findById(request.milestoneId()).ifPresent(m -> {
                submission.setMilestone(m);
                m.setStatus(MilestoneStatus.SUBMITTED);
                milestoneRepository.save(m);
            });
        }

        contract.setStatus(ContractStatus.IN_REVIEW);
        contractRepository.save(contract);

        WorkSubmission saved = submissionRepository.save(submission);

        notificationService.createAndSend(contract.getClient().getId(),
                "WORK_SUBMITTED",
                "Work Submitted for Review",
                freelancer.getFullName() + " submitted work for \"" + contract.getProject().getTitle() + "\"",
                "CONTRACT", contract.getId());

        return WorkSubmissionDto.from(saved);
    }

    @Transactional
    public WorkSubmissionDto approveWork(Long submissionId) {
        Long clientId = SecurityUtils.getCurrentUserId();
        WorkSubmission submission = getSubmissionForClient(submissionId, clientId);
        submission.setStatus(SubmissionStatus.APPROVED);
        submission.setReviewedAt(Instant.now());

        if (submission.getMilestone() != null) {
            submission.getMilestone().setStatus(MilestoneStatus.APPROVED);
            milestoneRepository.save(submission.getMilestone());
        }

        WorkSubmission saved = submissionRepository.save(submission);

        notificationService.createAndSend(submission.getFreelancer().getId(),
                "WORK_APPROVED",
                "Work Approved!",
                "Your submission for \"" + submission.getContract().getProject().getTitle() + "\" was approved.",
                "CONTRACT", submission.getContract().getId());

        return WorkSubmissionDto.from(saved);
    }

    @Transactional
    public WorkSubmissionDto requestRevision(Long submissionId, String feedback) {
        Long clientId = SecurityUtils.getCurrentUserId();
        WorkSubmission submission = getSubmissionForClient(submissionId, clientId);
        submission.setStatus(SubmissionStatus.REVISION_REQUESTED);
        submission.setRevisionFeedback(feedback);
        submission.setReviewedAt(Instant.now());

        if (submission.getMilestone() != null) {
            submission.getMilestone().setStatus(MilestoneStatus.REVISION_REQUESTED);
            milestoneRepository.save(submission.getMilestone());
        }

        submission.getContract().setStatus(ContractStatus.ACTIVE);
        contractRepository.save(submission.getContract());

        WorkSubmission saved = submissionRepository.save(submission);

        notificationService.createAndSend(submission.getFreelancer().getId(),
                "REVISION_REQUESTED",
                "Revision Requested",
                "The client requested a revision for \"" + submission.getContract().getProject().getTitle() + "\"",
                "CONTRACT", submission.getContract().getId());

        return WorkSubmissionDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<WorkSubmissionDto> getContractSubmissions(Long contractId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found: " + contractId));
        if (!contract.getClient().getId().equals(userId) && !contract.getFreelancer().getId().equals(userId)) {
            throw new ForbiddenException("Not your contract");
        }
        return submissionRepository.findByContractIdOrderByCreatedAtDesc(contractId)
                .stream().map(WorkSubmissionDto::from).toList();
    }

    private WorkSubmission getSubmissionForClient(Long submissionId, Long clientId) {
        WorkSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));
        if (!submission.getContract().getClient().getId().equals(clientId)) {
            throw new ForbiddenException("Not your contract's submission");
        }
        return submission;
    }
}
