package com.tank.armin.title;

import com.tank.armin.project.Project;
import com.tank.armin.script.Script;
import com.tank.armin.utils.Listeners;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                    Title.java                               ║
 * ║     Titre optimisé avec score SEO                           ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "titles")
@EntityListeners(AuditingEntityListener.class)
public class Title extends Listeners {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String content;

    // Score d'engagement (0-100)
    private int engagementScore;

    // Nombre de caractères
    private int characterCount;

    // Mots-clés détectés (séparés par virgule)
    private String keywords;

    // Titre sélectionné par l'user
    private boolean selected;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    // Script associé (optionnel)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "script_id")
    private Script script;
}