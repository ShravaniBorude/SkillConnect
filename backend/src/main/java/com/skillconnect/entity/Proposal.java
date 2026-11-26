package com.skillconnect.entity;

import com.skillconnect.entity.enums.ProposalStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;

@Entity
@Table(
    name = "proposals",
    uniqueConstraints = @UniqueConstraint(name = "uk_proposal_project_freelancer", columnNames = {"project_id", "freelancer_id"})
)
public class Proposal extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "freelancer_id", nullable = false)
    private User freelancer;

    @Column(name = "cover_letter", nullable = false, columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "proposed_budget", nullable = false, precision = 12, scale = 2)
    private BigDecimal proposedBudget;

    @Column(name = "estimated_days", nullable = false)
    private Integer estimatedDays;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProposalStatus status = ProposalStatus.PENDING;

    @Column(name = "negotiation_notes", columnDefinition = "TEXT")
    private String negotiationNotes;

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public User getFreelancer() {
        return freelancer;
    }

    public void setFreelancer(User freelancer) {
        this.freelancer = freelancer;
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }

    public BigDecimal getProposedBudget() {
        return proposedBudget;
    }

    public void setProposedBudget(BigDecimal proposedBudget) {
        this.proposedBudget = proposedBudget;
    }

    public Integer getEstimatedDays() {
        return estimatedDays;
    }

    public void setEstimatedDays(Integer estimatedDays) {
        this.estimatedDays = estimatedDays;
    }

    public ProposalStatus getStatus() {
        return status;
    }

    public void setStatus(ProposalStatus status) {
        this.status = status;
    }

    public String getNegotiationNotes() {
        return negotiationNotes;
    }

    public void setNegotiationNotes(String negotiationNotes) {
        this.negotiationNotes = negotiationNotes;
    }
}
