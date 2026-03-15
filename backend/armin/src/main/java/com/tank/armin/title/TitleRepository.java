package com.tank.armin.title;

import com.tank.armin.project.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TitleRepository extends JpaRepository<Title, Long> {
    List<Title> findByProjectOrderByEngagementScoreDesc(Project project);
    List<Title> findByProjectAndSelectedTrue(Project project);
}