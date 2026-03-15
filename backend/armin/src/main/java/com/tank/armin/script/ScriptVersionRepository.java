package com.tank.armin.script;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScriptVersionRepository extends JpaRepository<ScriptVersion, Long> {
    List<ScriptVersion> findByScriptOrderByVersionNumberDesc(Script script);
    long countByScript(Script script);
}