package com.skillconnect.repository;

import com.skillconnect.entity.FreelancerSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FreelancerSkillRepository extends JpaRepository<FreelancerSkill, Long> {
    List<FreelancerSkill> findByFreelancerProfileId(Long freelancerProfileId);
    Optional<FreelancerSkill> findByFreelancerProfileIdAndSkillId(Long freelancerProfileId, Long skillId);
    void deleteByFreelancerProfileIdAndSkillId(Long freelancerProfileId, Long skillId);
}
