package com.skillconnect.repository;

import com.skillconnect.entity.ProjectCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectCategoryRepository extends JpaRepository<ProjectCategory, Long> {
    Optional<ProjectCategory> findBySlug(String slug);
    List<ProjectCategory> findByActiveTrueOrderByNameAsc();
    List<ProjectCategory> findAllByOrderByNameAsc();
    boolean existsByNameIgnoreCase(String name);
}
