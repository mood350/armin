package com.tank.armin.script;

import com.tank.armin.ai.AiProvider;
import com.tank.armin.ai.AiService;
import com.tank.armin.idea.Idea;
import com.tank.armin.idea.IdeaRepository;
import com.tank.armin.idea.IdeaStatus;
import com.tank.armin.project.Project;
import com.tank.armin.project.ProjectRepository;
import com.tank.armin.subscription.Subscription;
import com.tank.armin.subscription.SubscriptionPlan;
import com.tank.armin.subscription.SubscriptionRepository;
import com.tank.armin.user.User;
import com.tank.armin.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScriptService {

    private final ScriptRepository scriptRepository;
    private final ScriptVersionRepository versionRepository;
    private final ProjectRepository projectRepository;
    private final IdeaRepository ideaRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final AiService aiService;
    private final ScriptPromptBuilder promptBuilder;

    // ═══════════════════════════════════════════════════════════════
    //  GÉNÉRATION IA
    // ═══════════════════════════════════════════════════════════════

    /**
     * Génère un script depuis une idée ou un titre.
     */
    @Transactional
    public ScriptResponse generate(ScriptRequest request) {
        User user = getCurrentUser();
        Subscription sub = getSubscription(user);

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new EntityNotFoundException("Projet introuvable"));

        // Récupère l'idée source si fournie
        Idea idea = null;
        if (request.getIdeaId() != null) {
            idea = ideaRepository.findById(request.getIdeaId()).orElse(null);
        }

        // Construit le prompt
        String prompt = promptBuilder.buildGenerationPrompt(
                request.getTitle(),
                request.getTone(),
                project.getPlatform().name(),
                idea
        );

        // Appelle l'IA
        String content = aiService.generate(prompt, getProvider(sub));

        // Calcule les stats
        int wordCount = content.split("\\s+").length;
        int duration = (wordCount * 60) / 130; // 130 mots/minute

        // Crée le script
        Script script = Script.builder()
                .title(request.getTitle())
                .content(content)
                .tone(request.getTone())
                .wordCount(wordCount)
                .estimatedDurationSeconds(duration)
                .project(project)
                .sourceIdea(idea)
                .build();

        scriptRepository.save(script);

        // Sauvegarde la version initiale
        saveVersion(script, content, "Version initiale générée par IA");

        // Marque l'idée comme convertie
        if (idea != null) {
            idea.setStatus(IdeaStatus.CONVERTED);
            ideaRepository.save(idea);
        }

        return ScriptResponse.from(script);
    }

    // ═══════════════════════════════════════════════════════════════
    //  AMÉLIORATION IA
    // ═══════════════════════════════════════════════════════════════

    /**
     * Améliore un script existant (reformuler, allonger, etc.)
     * Crée automatiquement une nouvelle version.
     */
    @Transactional
    public ScriptResponse improve(ScriptImprovementRequest request) {
        User user = getCurrentUser();
        Subscription sub = getSubscription(user);

        // Vérifie le quota d'amélioration
        checkImprovementQuota(sub);

        Script script = scriptRepository.findById(request.getScriptId())
                .orElseThrow(() -> new EntityNotFoundException("Script introuvable"));

        // Construit le prompt d'amélioration
        String prompt = promptBuilder.buildImprovementPrompt(
                script.getContent(),
                request.getAction(),
                request.getNewTone()
        );

        // Appelle l'IA
        String improvedContent = aiService.generate(prompt, getProvider(sub));

        // Met à jour le script
        int wordCount = improvedContent.split("\\s+").length;
        int duration = (wordCount * 60) / 130;

        script.setContent(improvedContent);
        script.setWordCount(wordCount);
        script.setEstimatedDurationSeconds(duration);

        if (request.getAction() ==
                ScriptImprovementRequest.ImprovementAction.CHANGE_TONE
                && request.getNewTone() != null) {
            script.setTone(request.getNewTone());
        }

        scriptRepository.save(script);

        // Sauvegarde la nouvelle version
        String changeDesc = switch (request.getAction()) {
            case REFORMULER   -> "Script reformulé";
            case ALLONGER     -> "Script allongé";
            case RACCOURCIR   -> "Script raccourci";
            case CHANGE_TONE  -> "Ton changé : " + request.getNewTone();
        };

        checkVersionQuota(script, sub);
        saveVersion(script, improvedContent, changeDesc);

        // Incrémente le quota
        sub.setScriptsUsedToday(sub.getScriptsUsedToday() + 1);
        subscriptionRepository.save(sub);

        return ScriptResponse.from(script);
    }

    // ═══════════════════════════════════════════════════════════════
    //  CRUD
    // ═══════════════════════════════════════════════════════════════
    @Transactional()
    public List<ScriptResponse> getByProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Projet introuvable"));
        return scriptRepository.findByProjectOrderByCreatedAtDesc(project)
                .stream().map(ScriptResponse::from).toList();
    }

    public ScriptResponse getById(Long id) {
        return ScriptResponse.from(scriptRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Script introuvable")));
    }

    /**
     * Sauvegarde manuelle du contenu édité par l'user.
     */
    @Transactional(readOnly = true)
    public ScriptResponse save(Long id, String content) {
        User user = getCurrentUser();
        Subscription sub = getSubscription(user);

        Script script = scriptRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Script introuvable"));

        int wordCount = content.split("\\s+").length;
        script.setContent(content);
        script.setWordCount(wordCount);
        script.setEstimatedDurationSeconds((wordCount * 60) / 130);

        scriptRepository.save(script);
        checkVersionQuota(script, sub);
        saveVersion(script, content, "Édition manuelle");

        return ScriptResponse.from(script);
    }

    public void delete(Long id) {
        scriptRepository.deleteById(id);
    }

    // ═══════════════════════════════════════════════════════════════
    //  UTILITAIRES PRIVÉS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Sauvegarde une version du script.
     */
    private void saveVersion(Script script, String content, String description) {
        long versionCount = versionRepository.countByScript(script);

        ScriptVersion version = ScriptVersion.builder()
                .versionNumber((int) versionCount + 1)
                .content(content)
                .changeDescription(description)
                .script(script)
                .build();

        versionRepository.save(version);
    }

    /**
     * Vérifie le quota de versions selon le plan.
     * FREE → 3 versions max par script.
     */
    private void checkVersionQuota(Script script, Subscription sub) {
        if (sub.getPlan() != SubscriptionPlan.FREE) return;

        long count = versionRepository.countByScript(script);
        if (count >= 3) {
            // Supprime la plus ancienne version pour garder 3 max
            List<ScriptVersion> versions = versionRepository
                    .findByScriptOrderByVersionNumberDesc(script);
            if (versions.size() >= 3) {
                versionRepository.delete(versions.get(versions.size() - 1));
            }
        }
    }

    private void checkImprovementQuota(Subscription sub) {
        if (sub.getPlan().isUnlimited()) return;
        resetQuotaIfNewDay(sub);

        int quota = sub.getPlan().getDailyScriptQuota();
        if (sub.getScriptsUsedToday() >= quota) {
            throw new RuntimeException(
                    "Quota d'amélioration atteint (" + quota +
                            "/jour). Passez au plan Pro !");
        }
    }

    private void resetQuotaIfNewDay(Subscription sub) {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime last = sub.getLastQuotaReset();
        if (last == null || last.toLocalDate().isBefore(now.toLocalDate())) {
            sub.setIdeasUsedToday(0);
            sub.setScriptsUsedToday(0);
            sub.setTitlesUsedToday(0);
            sub.setLastQuotaReset(now);
            subscriptionRepository.save(sub);
        }
    }

    private AiProvider getProvider(Subscription sub) {
        return switch (sub.getPlan()) {
            case PRO, BUSINESS -> AiProvider.GROQ;
            default            -> AiProvider.GEMINI;
        };
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    private Subscription getSubscription(User user) {
        return subscriptionRepository.findByUser(user).orElseThrow();
    }
}