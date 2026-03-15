package com.tank.armin.script;

import com.tank.armin.project.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScriptRepository extends JpaRepository<Script, Long> {
    List<Script> findByProjectOrderByCreatedAtDesc(Project project);
}