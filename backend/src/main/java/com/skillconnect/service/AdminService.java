package com.skillconnect.service;

import com.skillconnect.dto.common.PageResponse;
import com.skillconnect.entity.*;
import com.skillconnect.entity.enums.*;
import com.skillconnect.exception.*;
import com.skillconnect.repository.*;
import com.skillconnect.security.SecurityUtils;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ContractRepository contractRepository;
    private final PaymentRepository paymentRepository;
    private final DisputeRepository disputeRepository;
    private final VerificationDocumentRepository verificationDocumentRepository;
    private final ReportedUserRepository reportedUserRepository;
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final TransactionRepository transactionRepository;
    private final ProjectCategoryRepository categoryRepository;
    private final SkillRepository skillRepository;

    public AdminService(UserRepository userRepository,
                        ProjectRepository projectRepository,
                        ContractRepository contractRepository,
                        PaymentRepository paymentRepository,
                        DisputeRepository disputeRepository,
                        VerificationDocumentRepository verificationDocumentRepository,
                        ReportedUserRepository reportedUserRepository,
                        FreelancerProfileRepository freelancerProfileRepository,
                        TransactionRepository transactionRepository,
                        ProjectCategoryRepository categoryRepository,
                        SkillRepository skillRepository) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.contractRepository = contractRepository;
        this.paymentRepository = paymentRepository;
        this.disputeRepository = disputeRepository;
        this.verificationDocumentRepository = verificationDocumentRepository;
        this.reportedUserRepository = reportedUserRepository;
        this.freelancerProfileRepository = freelancerProfileRepository;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.skillRepository = skillRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalClients = userRepository.countByRole_Name(RoleName.ROLE_CLIENT);
        long totalFreelancers = userRepository.countByRole_Name(RoleName.ROLE_FREELANCER);
        long totalProjects = projectRepository.count();
        long openProjects = projectRepository.countByStatus(ProjectStatus.OPEN);
        long activeContracts = contractRepository.countByStatus(ContractStatus.ACTIVE);
        long completedContracts = contractRepository.countByStatus(ContractStatus.COMPLETED);
        long totalPayments = paymentRepository.count();
        long capturedPayments = paymentRepository.countByStatus(PaymentStatus.CAPTURED);
        BigDecimal totalVolume = paymentRepository.sumCapturedVolume();
        BigDecimal totalFees = paymentRepository.sumCapturedPlatformFees();
        long openDisputes = disputeRepository.countByStatus(DisputeStatus.OPEN);
        long pendingVerifications = verificationDocumentRepository.countByStatus(DocumentReviewStatus.PENDING);

        Map<String, Object> stats = new java.util.LinkedHashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalClients", totalClients);
        stats.put("totalFreelancers", totalFreelancers);
        stats.put("totalProjects", totalProjects);
        stats.put("openProjects", openProjects);
        stats.put("activeContracts", activeContracts);
        stats.put("completedContracts", completedContracts);
        stats.put("totalPayments", totalPayments);
        stats.put("capturedPayments", capturedPayments);
        stats.put("totalVolume", totalVolume != null ? totalVolume : BigDecimal.ZERO);
        stats.put("totalPlatformFees", totalFees != null ? totalFees : BigDecimal.ZERO);
        stats.put("openDisputes", openDisputes);
        stats.put("pendingVerifications", pendingVerifications);
        return stats;
    }

    @Transactional(readOnly = true)
    public Page<User> getUsers(String keyword, String roleName, String status, int page, int size) {
        RoleName role = null;
        AccountStatus accountStatus = null;
        try { if (roleName != null && !roleName.isBlank()) role = RoleName.valueOf(roleName); } catch (Exception ignored) {}
        try { if (status != null && !status.isBlank()) accountStatus = AccountStatus.valueOf(status); } catch (Exception ignored) {}
        return userRepository.searchAdminUsers(keyword.isBlank() ? null : keyword, role, accountStatus, PageRequest.of(page, size));
    }

    @Transactional
    public void updateUserStatus(Long userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setAccountStatus(AccountStatus.valueOf(status));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public Page<VerificationDocument> getPendingVerifications(int page, int size) {
        return verificationDocumentRepository.findByStatusOrderByCreatedAtDesc(
                DocumentReviewStatus.PENDING, PageRequest.of(page, size));
    }

    @Transactional
    public VerificationDocument reviewVerificationDocument(Long docId, String status, String adminNotes) {
        VerificationDocument doc = verificationDocumentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + docId));
        Long adminId = SecurityUtils.getCurrentUserId();
        doc.setStatus(DocumentReviewStatus.valueOf(status));
        doc.setAdminNotes(adminNotes);
        doc.setReviewedAt(Instant.now());
        userRepository.findById(adminId).ifPresent(doc::setReviewedBy);

        if (DocumentReviewStatus.APPROVED.name().equals(status)) {
            doc.getFreelancerProfile().setVerificationStatus(VerificationStatus.VERIFIED);
            freelancerProfileRepository.save(doc.getFreelancerProfile());
        } else if (DocumentReviewStatus.REJECTED.name().equals(status)) {
            doc.getFreelancerProfile().setVerificationStatus(VerificationStatus.REJECTED);
            freelancerProfileRepository.save(doc.getFreelancerProfile());
        }
        return verificationDocumentRepository.save(doc);
    }

    @Transactional(readOnly = true)
    public Page<Dispute> getAllDisputes(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (status != null && !status.isBlank()) {
            return disputeRepository.findByStatusOrderByCreatedAtDesc(DisputeStatus.valueOf(status), pageable);
        }
        return disputeRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional
    public Dispute resolveDispute(Long disputeId, String resolution, String adminNotes) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found: " + disputeId));
        Long adminId = SecurityUtils.getCurrentUserId();
        dispute.setStatus(DisputeStatus.valueOf(resolution));
        dispute.setAdminNotes(adminNotes);
        dispute.setResolvedAt(Instant.now());
        userRepository.findById(adminId).ifPresent(dispute::setResolvedBy);
        return disputeRepository.save(dispute);
    }

    @Transactional(readOnly = true)
    public Page<Payment> getAllTransactions(int page, int size) {
        return paymentRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    @Transactional
    public ProjectCategory createCategory(String name, String slug, String description, String icon) {
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Category already exists: " + name);
        }
        ProjectCategory cat = new ProjectCategory();
        cat.setName(name);
        cat.setSlug(slug);
        cat.setDescription(description);
        cat.setIcon(icon);
        return categoryRepository.save(cat);
    }

    @Transactional
    public void toggleCategoryStatus(Long categoryId, boolean active) {
        ProjectCategory cat = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId));
        cat.setActive(active);
        categoryRepository.save(cat);
    }

    @Transactional
    public Skill createSkill(String name, String slug, String categoryHint) {
        Skill skill = new Skill();
        skill.setName(name);
        skill.setSlug(slug);
        skill.setCategoryHint(categoryHint);
        return skillRepository.save(skill);
    }
}
