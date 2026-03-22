package com.tank.armin.project;

import com.tank.armin.subscription.Subscription;
import com.tank.armin.subscription.SubscriptionPlan;
import com.tank.armin.subscription.SubscriptionRepository;
import com.tank.armin.user.User;
import com.tank.armin.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;

    @Transactional
    public ProjectResponse create(ProjectRequest request) {
        User user = getCurrentUser();
        checkProjectQuota(user);

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .platform(request.getPlatform())
                .niche(request.getNiche())
                .archived(false)
                .owner(user)
                .build();

        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getMyProjects() {
        User user = getCurrentUser();
        return projectRepository.findAllAccessibleByUser(user)
                .stream()
                .map(ProjectResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getById(Long id) {
        Project project = findProjectWithAccess(id);
        return ProjectResponse.from(project);
    }

    @Transactional
    public ProjectResponse update(Long id, ProjectRequest request) {
        Project project = findProjectOwnedByCurrentUser(id);

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setPlatform(request.getPlatform());
        project.setNiche(request.getNiche());

        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional
    public void archive(Long id) {
        Project project = findProjectOwnedByCurrentUser(id);
        project.setArchived(true);
        projectRepository.save(project);
    }

    @Transactional
    public void delete(Long id) {
        Project project = findProjectOwnedByCurrentUser(id);
        projectRepository.delete(project);
    }

    @Transactional
    public void addCollaborator(Long projectId, String collaboratorEmail) {
        User owner = getCurrentUser();
        checkCollaborationAccess(owner);

        Project project = findProjectOwnedByCurrentUser(projectId);

        User collaborator = userRepository.findByEmail(collaboratorEmail)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Utilisateur introuvable : " + collaboratorEmail));

        if (project.getCollaborators().contains(collaborator)) {
            throw new RuntimeException("Cet utilisateur est déjà collaborateur");
        }

        project.getCollaborators().add(collaborator);
        projectRepository.save(project);
    }

    @Transactional
    public void removeCollaborator(Long projectId, String collaboratorEmail) {
        Project project = findProjectOwnedByCurrentUser(projectId);

        User collaborator = userRepository.findByEmail(collaboratorEmail)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Utilisateur introuvable : " + collaboratorEmail));

        project.getCollaborators().remove(collaborator);
        projectRepository.save(project);
    }

    @Transactional(readOnly = true)
    public List<CollaboratorResponse> getCollaborators(Long projectId) {
        Project project = findProjectWithAccess(projectId);
        return project.getCollaborators()
                .stream()
                .map(CollaboratorResponse::from)
                .toList();
    }

    // ─── Utilitaires privés ───────────────────────────────────────────────────

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    private void checkProjectQuota(User user) {
        Subscription sub = subscriptionRepository.findByUser(user)
                .orElseThrow();

        if (sub.getPlan() == SubscriptionPlan.FREE) {
            long count = projectRepository.countByOwnerAndArchivedFalse(user);
            if (count >= sub.getPlan().getMaxProjects()) {
                throw new RuntimeException(
                        "Limite de " + sub.getPlan().getMaxProjects() +
                                " projets atteinte. Passez au plan Pro !");
            }
        }
    }

    private Project findProjectWithAccess(Long id) {
        User user = getCurrentUser();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Projet introuvable"));

        boolean isOwner = project.getOwner().equals(user);
        boolean isCollaborator = project.getCollaborators().contains(user);

        if (!isOwner && !isCollaborator) {
            throw new AccessDeniedException("Accès refusé à ce projet");
        }

        return project;
    }

    private Project findProjectOwnedByCurrentUser(Long id) {
        User user = getCurrentUser();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Projet introuvable"));

        if (!project.getOwner().equals(user)) {
            throw new AccessDeniedException(
                    "Seul le propriétaire peut effectuer cette action");
        }

        return project;
    }

    private void checkCollaborationAccess(User user) {
        Subscription sub = subscriptionRepository.findByUser(user)
                .orElse(null);

        // Si pas de subscription (ex: admin), on autorise
        if (sub == null) return;

        if (sub.getPlan() == SubscriptionPlan.FREE) {
            throw new AccessDeniedException(
                    "La collaboration est réservée aux plans Pro et Business");
        }
    }
}