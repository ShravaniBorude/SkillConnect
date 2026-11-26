package com.skillconnect.service;

import com.skillconnect.dto.common.PageResponse;
import com.skillconnect.dto.proposal.ProposalDto;
import com.skillconnect.dto.proposal.SubmitProposalRequest;
import com.skillconnect.entity.*;
import com.skillconnect.entity.enums.ProposalStatus;
import com.skillconnect.exception.*;
import com.skillconnect.repository.*;
import com.skillconnect.security.SecurityUtils;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProposalService {

    private final ProposalRepository proposalRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ProposalService(ProposalRepository proposalRepository,
                           ProjectRepository projectRepository,
                           UserRepository userRepository,
                           NotificationService notificationService) {
        this.proposalRepository = proposalRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ProposalDto submitProposal(SubmitProposalRequest request) {
        Long freelancerId = SecurityUtils.getCurrentUserId();
        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + request.projectId()));

        if (!project.getStatus().name().equals("OPEN")) {
            throw new BadRequestException("This project is not accepting proposals");
        }
        if (project.getClient().getId().equals(freelancerId)) {
            throw new BadRequestException("You cannot submit a proposal to your own project");
        }
        if (proposalRepository.existsByProjectIdAndFreelancerId(request.projectId(), freelancerId)) {
            throw new ConflictException("You have already submitted a proposal for this project");
        }

        User freelancer = userRepository.findById(freelancerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Proposal proposal = new Proposal();
        proposal.setProject(project);
        proposal.setFreelancer(freelancer);
        proposal.setCoverLetter(request.coverLetter());
        proposal.setProposedBudget(request.proposedBudget());
        proposal.setEstimatedDays(request.estimatedDays());
        proposal.setNegotiationNotes(request.negotiationNotes());
        proposal.setStatus(ProposalStatus.PENDING);

        Proposal saved = proposalRepository.save(proposal);

        // Increment proposal count
        project.setProposalCount(project.getProposalCount() + 1);
        projectRepository.save(project);

        // Notify client
        notificationService.createAndSend(project.getClient().getId(),
                "PROPOSAL_RECEIVED",
                "New Proposal Received",
                freelancer.getFullName() + " submitted a proposal for \"" + project.getTitle() + "\"",
                "PROJECT", project.getId());

        return ProposalDto.from(saved);
    }

    @Transactional
    public void withdrawProposal(Long proposalId) {
        Long freelancerId = SecurityUtils.getCurrentUserId();
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found: " + proposalId));
        if (!proposal.getFreelancer().getId().equals(freelancerId)) {
            throw new ForbiddenException("Not your proposal");
        }
        if (proposal.getStatus() == ProposalStatus.ACCEPTED) {
            throw new BadRequestException("Cannot withdraw an accepted proposal");
        }
        proposal.setStatus(ProposalStatus.WITHDRAWN);
        proposalRepository.save(proposal);
    }

    @Transactional
    public ProposalDto shortlistProposal(Long proposalId) {
        Long clientId = SecurityUtils.getCurrentUserId();
        Proposal proposal = getProposalForClient(proposalId, clientId);
        proposal.setStatus(ProposalStatus.SHORTLISTED);
        return ProposalDto.from(proposalRepository.save(proposal));
    }

    @Transactional
    public ProposalDto rejectProposal(Long proposalId) {
        Long clientId = SecurityUtils.getCurrentUserId();
        Proposal proposal = getProposalForClient(proposalId, clientId);
        proposal.setStatus(ProposalStatus.REJECTED);
        Proposal saved = proposalRepository.save(proposal);
        notificationService.createAndSend(proposal.getFreelancer().getId(),
                "PROPOSAL_REJECTED",
                "Proposal Not Selected",
                "Your proposal for \"" + proposal.getProject().getTitle() + "\" was not selected",
                "PROJECT", proposal.getProject().getId());
        return ProposalDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<ProposalDto> getProjectProposals(Long projectId) {
        Long clientId = SecurityUtils.getCurrentUserId();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (!project.getClient().getId().equals(clientId)) {
            throw new ForbiddenException("Not your project");
        }
        return proposalRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream().map(ProposalDto::from).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<ProposalDto> getMyProposals(int page, int size) {
        Long freelancerId = SecurityUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);
        return PageResponse.from(proposalRepository.findByFreelancerIdOrderByCreatedAtDesc(freelancerId, pageable), ProposalDto::from);
    }

    private Proposal getProposalForClient(Long proposalId, Long clientId) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found: " + proposalId));
        if (!proposal.getProject().getClient().getId().equals(clientId)) {
            throw new ForbiddenException("Not your project's proposal");
        }
        return proposal;
    }
}
