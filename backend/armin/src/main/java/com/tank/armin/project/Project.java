package com.tank.armin.project;

import com.tank.armin.user.User;
import com.tank.armin.utils.Listeners;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.ArrayList;
import java.util.List;

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                    Project.java                             ║
 * ║     Conteneur principal — regroupe idées, scripts, titres   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Limites par plan :
 *  FREE     → 3 projets max
 *  PRO      → illimité
 *  BUSINESS → illimité + collaboration
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "projects")
@EntityListeners(AuditingEntityListener.class)
public class Project extends Listeners {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    private Platform platform;

    // Niche/thème du projet (ex: "Gaming", "Finance", "Cuisine")
    private String niche;

    // Actif ou archivé
    private boolean archived;

    // Propriétaire du projet
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    /**
     * Collaborateurs (Pro/Business uniquement)
     * Un projet peut avoir plusieurs collaborateurs
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "project_collaborators",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private List<User> collaborators = new ArrayList<>();
}