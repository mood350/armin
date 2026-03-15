package com.tank.armin.project;

import com.tank.armin.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Projets dont l'user est propriétaire
    List<Project> findByOwnerAndArchivedFalse(User owner);

    // Projets dont l'user est collaborateur
    List<Project> findByCollaboratorsContainingAndArchivedFalse(User user);

    // Tous les projets accessibles (owned + collaborateur)
    @Query("""
        SELECT p FROM Project p
        WHERE (p.owner = :user OR :user MEMBER OF p.collaborators)
        AND p.archived = false
        ORDER BY p.createdAt DESC
    """)
    List<Project> findAllAccessibleByUser(User user);

    // Compte les projets actifs d'un user (pour quota FREE)
    long countByOwnerAndArchivedFalse(User owner);
}