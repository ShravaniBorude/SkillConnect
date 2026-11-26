package com.skillconnect.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "freelancer_skills",
    uniqueConstraints = @UniqueConstraint(name = "uk_freelancer_skill", columnNames = {"freelancer_profile_id", "skill_id"})
)
public class FreelancerSkill extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "freelancer_profile_id", nullable = false)
    private FreelancerProfile freelancerProfile;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "proficiency_level", nullable = false, length = 30)
    private String proficiencyLevel = "INTERMEDIATE";

    @Column(name = "years_used")
    private Integer yearsUsed = 1;

    public FreelancerProfile getFreelancerProfile() {
        return freelancerProfile;
    }

    public void setFreelancerProfile(FreelancerProfile freelancerProfile) {
        this.freelancerProfile = freelancerProfile;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public String getProficiencyLevel() {
        return proficiencyLevel;
    }

    public void setProficiencyLevel(String proficiencyLevel) {
        this.proficiencyLevel = proficiencyLevel;
    }

    public Integer getYearsUsed() {
        return yearsUsed;
    }

    public void setYearsUsed(Integer yearsUsed) {
        this.yearsUsed = yearsUsed;
    }
}
