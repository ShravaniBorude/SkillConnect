package com.skillconnect.service;

import com.skillconnect.dto.common.PageResponse;
import com.skillconnect.dto.contract.ContractDto;
import com.skillconnect.dto.contract.CreateContractRequest;
import com.skillconnect.entity.*;
import com.skillconnect.entity.enums.*;
import com.skillconnect.exception.*;
import com.skillconnect.repository.*;
import com.skillconnect.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class ContractService {

    private final ContractRepository contractRepository;
    private final ProposalRepository proposalRepository;
    private final ProjectRepository projectRepository;
    private final MilestoneRepository milestoneRepository;
    private final NotificationService notificationService;

    @Value("${app.razorpay.platform-fee-percent:10.0}")
    private double platformFeePercent;

    public ContractService(ContractRepository contractRepository,
                           ProposalRepository proposalRepository,
                           ProjectRepository projectRepository,
                           MilestoneRepository milestoneRepository,
                           NotificationService notificationService) {
        this.contractRepository = contractRepository;
        this.proposalRepository = proposalRepository;
        this.projectRepository = projectRepository;
        this.milestoneRepository = milestoneRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ContractDto createContract(CreateContractRequest request) {
        Long clientId = SecurityUtils.getCurrentUserId();
        Proposal proposal = proposalRepository.findById(request.proposalId())
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found: " + request.proposalId()));

        if (!proposal.getProject().getClient().getId().equals(clientId)) {
            throw new ForbiddenException("Not your project's proposal");
        }
        if (contractRepository.findByProposalId(proposal.getId()).isPresent()) {
            throw new ConflictException("A contract already exists for this proposal");
        }
        if (proposal.getStatus() == ProposalStatus.REJECTED || proposal.getStatus() == ProposalStatus.WITHDRAWN) {
            throw new BadRequestException("Cannot create contract from a rejected or withdrawn proposal");
        }

        Contract contract = new Contract();
        contract.setProject(proposal.getProject());
        contract.setProposal(proposal);
        contract.setClient(proposal.getProject().getClient());
        contract.setFreelancer(proposal.getFreelancer());
        contract.setTitle(request.title());
        contract.setTerms(request.terms());
        contract.setAgreedAmount(proposal.getProposedBudget());
        contract.setPlatformFeePercent(BigDecimal.valueOf(platformFeePercent));
        contract.setStartDate(request.startDate());
        contract.setDueDate(request.dueDate());
        contract.setStatus(ContractStatus.PENDING_ACCEPTANCE);
        contract.setClientSignedAt(Instant.now());

        Contract saved = contractRepository.save(contract);

        // Add milestones
        if (request.milestones() != null && !request.milestones().isEmpty()) {
            AtomicInteger order = new AtomicInteger(1);
            request.milestones().forEach(m -> {
                Milestone milestone = new Milestone();
                milestone.setContract(saved);
                milestone.setTitle(m.title());
                milestone.setDescription(m.description());
                milestone.setAmount(m.amount());
                milestone.setDueDate(m.dueDate());
                milestone.setSequenceOrder(m.sequenceOrder() != null ? m.sequenceOrder() : order.getAndIncrement());
                milestoneRepository.save(milestone);
            });
        }

        proposal.setStatus(ProposalStatus.ACCEPTED);
        proposalRepository.save(proposal);

        // Notify freelancer
        notificationService.createAndSend(proposal.getFreelancer().getId(),
                "CONTRACT_INVITE",
                "Contract Invitation",
                "You have received a contract offer for \"" + proposal.getProject().getTitle() + "\". Please review and accept.",
                "CONTRACT", saved.getId());

        return ContractDto.from(contractRepository.findById(saved.getId()).get());
    }

    @Transactional
    public ContractDto freelancerAcceptContract(Long contractId) {
        Long freelancerId = SecurityUtils.getCurrentUserId();
        Contract contract = getContractForFreelancer(contractId, freelancerId);
        if (contract.getStatus() != ContractStatus.PENDING_ACCEPTANCE) {
            throw new BadRequestException("Contract is not pending acceptance");
        }
        contract.setFreelancerSignedAt(Instant.now());
        contract.setStatus(ContractStatus.ACTIVE);

        // Update project status
        Project project = contract.getProject();
        project.setStatus(ProjectStatus.IN_PROGRESS);
        projectRepository.save(project);

        Contract saved = contractRepository.save(contract);

        notificationService.createAndSend(contract.getClient().getId(),
                "CONTRACT_ACTIVATED",
                "Contract Accepted",
                contract.getFreelancer().getFullName() + " accepted the contract for \"" + project.getTitle() + "\"",
                "CONTRACT", contractId);

        return ContractDto.from(saved);
    }

    @Transactional
    public ContractDto freelancerDeclineContract(Long contractId) {
        Long freelancerId = SecurityUtils.getCurrentUserId();
        Contract contract = getContractForFreelancer(contractId, freelancerId);
        if (contract.getStatus() != ContractStatus.PENDING_ACCEPTANCE) {
            throw new BadRequestException("Contract is not pending acceptance");
        }
        contract.setStatus(ContractStatus.CANCELLED);
        // Reopen the project
        contract.getProject().setStatus(ProjectStatus.OPEN);
        projectRepository.save(contract.getProject());
        return ContractDto.from(contractRepository.save(contract));
    }

    @Transactional
    public ContractDto markComplete(Long contractId) {
        Long clientId = SecurityUtils.getCurrentUserId();
        Contract contract = getContractForClient(contractId, clientId);
        contract.setStatus(ContractStatus.COMPLETED);
        contract.setCompletedAt(Instant.now());
        contract.getProject().setStatus(ProjectStatus.COMPLETED);
        projectRepository.save(contract.getProject());
        Contract saved = contractRepository.save(contract);
        notificationService.createAndSend(contract.getFreelancer().getId(),
                "CONTRACT_COMPLETED",
                "Contract Completed",
                "Your contract for \"" + contract.getProject().getTitle() + "\" has been marked complete.",
                "CONTRACT", contractId);
        return ContractDto.from(saved);
    }

    @Transactional(readOnly = true)
    public ContractDto getContractById(Long contractId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found: " + contractId));
        if (!contract.getClient().getId().equals(userId) && !contract.getFreelancer().getId().equals(userId)) {
            throw new ForbiddenException("Not your contract");
        }
        return ContractDto.from(contract);
    }

    @Transactional(readOnly = true)
    public PageResponse<ContractDto> getMyContracts(int page, int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        String role = SecurityUtils.getCurrentUser().getRoleName();
        Pageable pageable = PageRequest.of(page, size);
        if (role.contains("CLIENT")) {
            return PageResponse.from(contractRepository.findByClientIdOrderByCreatedAtDesc(userId, pageable), ContractDto::from);
        }
        return PageResponse.from(contractRepository.findByFreelancerIdOrderByCreatedAtDesc(userId, pageable), ContractDto::from);
    }

    private Contract getContractForClient(Long contractId, Long clientId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found: " + contractId));
        if (!contract.getClient().getId().equals(clientId)) {
            throw new ForbiddenException("Not your contract");
        }
        return contract;
    }

    private Contract getContractForFreelancer(Long contractId, Long freelancerId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found: " + contractId));
        if (!contract.getFreelancer().getId().equals(freelancerId)) {
            throw new ForbiddenException("Not your contract");
        }
        return contract;
    }
}
