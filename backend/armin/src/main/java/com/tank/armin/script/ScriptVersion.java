package com.tank.armin.script;

import com.tank.armin.utils.Listeners;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Historique des versions d'un script.
 * FREE     → 3 versions max
 * PRO/BUSINESS → illimité
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "script_versions")
@EntityListeners(AuditingEntityListener.class)
public class ScriptVersion extends Listeners {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Numéro de version (1, 2, 3...)
    private int versionNumber;

    // Contenu du script à ce moment
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // Raison de la modification
    private String changeDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "script_id", nullable = false)
    private Script script;
}