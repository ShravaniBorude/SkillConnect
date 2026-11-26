package com.skillconnect.repository;

import com.skillconnect.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    Optional<Skill> findBySlug(String slug);
    Optional<Skill> findByNameIgnoreCase(String name);
    List<Skill> findByIdIn(Collection<Long> ids);
    List<Skill> findAllByOrderByNameAsc();
}
