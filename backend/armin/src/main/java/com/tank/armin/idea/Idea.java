package com.tank.armin.idea;

import com.tank.armin.project.Project;
import com.tank.armin.project.Platform;
import com.tank.armin.utils.Listeners;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                    Idea.java                                ║
 * ║     Idée de contenu générée par l'IA                        ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ideas")
@EntityListeners(AuditingEntityListener.class)
public class Idea extends Listeners {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Titre de l'idée générée
    @Column(nullable = false)
    private String title;

    // Description courte de l'idée
    @Column(columnDefinition = "TEXT")
    private String description;

    // Tags personnels de l'user
    private String tags;

    // Notes personnelles de l'user
    @Column(columnDefinition = "TEXT")
    private String notes;

    // Plateforme cible
    @Enumerated(EnumType.STRING)
    private Platform platform;

    // Format du contenu
    private String format; // tutoriel, review, vlog, shorts...

    @Enumerated(EnumType.STRING)
    private IdeaStatus status;

    // Projet auquel appartient l'idée
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
}