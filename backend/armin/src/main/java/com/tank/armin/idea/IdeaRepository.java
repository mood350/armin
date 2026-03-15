package com.tank.armin.idea;

import com.tank.armin.project.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IdeaRepository extends JpaRepository<Idea, Long> {
    List<Idea> findByProjectOrderByCreatedAtDesc(Project project);
    List<Idea> findByProjectAndStatus(Project project, IdeaStatus status);
}