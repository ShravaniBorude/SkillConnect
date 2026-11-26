package com.skillconnect.repository;

import com.skillconnect.entity.Project;
import com.skillconnect.entity.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;

public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {
    Page<Project> findByClientIdOrderByCreatedAtDesc(Long clientId, Pageable pageable);
    long countByStatus(ProjectStatus status);

    @Query("""
        SELECT DISTINCT p FROM Project p
        JOIN p.requiredSkills s
        WHERE p.status = 'OPEN' AND s.id IN :skillIds
        ORDER BY p.createdAt DESC
        """)
    Page<Project> findRecommendedBySkillIds(@Param("skillIds") Collection<Long> skillIds, Pageable pageable);
}
