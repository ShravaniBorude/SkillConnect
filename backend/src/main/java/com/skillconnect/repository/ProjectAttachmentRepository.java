package com.skillconnect.repository;

import com.skillconnect.entity.ProjectAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectAttachmentRepository extends JpaRepository<ProjectAttachment, Long> {
    List<ProjectAttachment> findByProjectId(Long projectId);
}
