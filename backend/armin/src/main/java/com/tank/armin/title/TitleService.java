package com.tank.armin.title;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tank.armin.ai.AiProvider;
import com.tank.armin.ai.AiService;
import com.tank.armin.project.Project;
import com.tank.armin.project.ProjectRepository;
import com.tank.armin.script.Script;
import com.tank.armin.script.ScriptRepository;
import com.tank.armin.subscription.Subscription;
import com.tank.armin.subscription.SubscriptionRepository;
import com.tank.armin.user.User;
import com.tank.armin.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TitleService {

    private final TitleRepository titleRepository;
    private final ProjectRepository projectRepository;
    private final ScriptRepository scriptRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final AiService aiService;
    private final TitlePromptBuilder promptBuilder;
    private final ObjectMapper objectMapper;

    // ═══════════════════════════════════════════════════════════════
    //  GÉNÉRATION IA
    // ═══════════════════════════════════════════════════════════════

    public List<TitleResponse> generate(TitleGenerationRequest request) {
        User user = getCurrentUser();
        Subscription sub = getSubscription(user);

        // Vérifie le quota
        checkQuota(sub);

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new EntityNotFoundException("Projet introuvable"));

        Script script = null;
        if (request.getScriptId() != null) {
            script = scriptRepository.findById(request.getScriptId()).orElse(null);
        }

        // Appelle l'IA
        String prompt = promptBuilder.build(request);
        String aiResponse = aiService.generate(prompt, getProvider(sub));

        // Parse et sauvegarde
        List<Title> titles = parseAndSaveTitles(
                aiResponse, request, project, script);

        // Incrémente le quota
        sub.setTitlesUsedToday(sub.getTitlesUsedToday() + 1);
        subscriptionRepository.save(sub);

        return titles.stream()
                .map(t -> TitleResponse.from(t, request.getPlatform()))
                .toList();
    }

    // ═══════════════════════════════════════════════════════════════
    //  CRUD
    // ═══════════════════════════════════════════════════════════════

    public List<TitleResponse> getByProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Projet introuvable"));
        return titleRepository
                .findByProjectOrderByEngagementScoreDesc(project)
                .stream()
                .map(t -> TitleResponse.from(t, project.getPlatform()))
                .toList();
    }

    /**
     * Sélectionne un titre comme titre final du projet.
     */
    public TitleResponse select(Long id) {
        Title title = titleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Titre introuvable"));

        // Désélectionne tous les autres titres du projet
        titleRepository.findByProjectAndSelectedTrue(title.getProject())
                .forEach(t -> {
                    t.setSelected(false);
                    titleRepository.save(t);
                });

        title.setSelected(true);
        return TitleResponse.from(titleRepository.save(title),
                title.getProject().getPlatform());
    }

    public void delete(Long id) {
        titleRepository.deleteById(id);
    }

    // ═══════════════════════════════════════════════════════════════
    //  UTILITAIRES PRIVÉS
    // ═══════════════════════════════════════════════════════════════

    private List<Title> parseAndSaveTitles(
            String aiResponse,
            TitleGenerationRequest request,
            Project project,
            Script script
    ) {
        List<Title> titles = new ArrayList<>();

        try {
            String cleanJson = aiResponse
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();

            JsonNode root = objectMapper.readTree(cleanJson);
            JsonNode titlesNode = root.get("titles");

            for (JsonNode node : titlesNode) {
                String content = node.get("content").asText();
                Title title = Title.builder()
                        .content(content)
                        .engagementScore(node.get("score").asInt())
                        .characterCount(content.length())
                        .keywords(node.has("keywords")
                                ? node.get("keywords").asText() : "")
                        .selected(false)
                        .project(project)
                        .script(script)
                        .build();

                titles.add(titleRepository.save(title));
            }
        } catch (Exception e) {
            log.error("Erreur parsing titres IA : {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la génération des titres");
        }

        return titles;
    }

    private void checkQuota(Subscription sub) {
        if (sub.getPlan().isUnlimited()) return;
        resetQuotaIfNewDay(sub);

        int quota = sub.getPlan().getDailyTitleQuota();
        if (sub.getTitlesUsedToday() >= quota) {
            throw new RuntimeException(
                    "Quota de titres atteint (" + quota +
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