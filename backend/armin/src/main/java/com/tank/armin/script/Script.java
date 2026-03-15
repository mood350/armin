package com.tank.armin.script;

import com.tank.armin.idea.Idea;
import com.tank.armin.project.Project;
import com.tank.armin.utils.Listeners;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.ArrayList;
import java.util.List;

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                    Script.java                              ║
 * ║     Script de contenu avec versioning                       ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "scripts")
@EntityListeners(AuditingEntityListener.class)
public class Script extends Listeners {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;

    // Contenu actuel du script
    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private ScriptTone tone;

    // Nombre de mots
    private int wordCount;

    // Durée estimée de lecture/élocution en secondes
    // Base : 130 mots/minute
    private int estimatedDurationSeconds;

    // Projet parent
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    // Idée source (optionnelle)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idea_id")
    private Idea sourceIdea;

    // Historique des versions
    @OneToMany(mappedBy = "script",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @Builder.Default
    private List<ScriptVersion> versions = new ArrayList<>();
}