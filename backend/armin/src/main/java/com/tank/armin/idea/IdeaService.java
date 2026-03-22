package com.tank.armin.idea;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tank.armin.ai.AiProvider;
import com.tank.armin.ai.AiService;
import com.tank.armin.project.Project;
import com.tank.armin.project.ProjectRepository;
import com.tank.armin.subscription.Subscription;
import com.tank.armin.subscription.SubscriptionRepository;
import com.tank.armin.user.User;
import com.tank.armin.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class IdeaService {

    private final IdeaRepository ideaRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final AiService aiService;
    private final IdeaPromptBuilder promptBuilder;
    private final ObjectMapper objectMapper;

    @Transactional
    public List<IdeaResponse> generate(IdeaGenerationRequest request) {
        User user = getCurrentUser();
        Subscription sub = getSubscription(user);

        checkQuota(sub);

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new EntityNotFoundException("Projet introuvable"));

        AiProvider provider = getProvider(sub);

        String prompt = promptBuilder.build(request);

        log.info("Génération d'idées via {} pour user {}", provider, user.getEmail());
        String aiResponse = aiService.generate(prompt, provider);

        List<Idea> ideas = parseAndSaveIdeas(aiResponse, request, project);

        sub.setIdeasUsedToday(sub.getIdeasUsedToday() + request.getCount());
        subscriptionRepository.save(sub);

        return ideas.stream().map(IdeaResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<IdeaResponse> getByProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Projet introuvable"));
        return ideaRepository.findByProjectOrderByCreatedAtDesc(project)
                .stream().map(IdeaResponse::from).toList();
    }

    @Transactional
    public IdeaResponse updateStatus(Long id, IdeaStatus status) {
        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Idée introuvable"));
        idea.setStatus(status);
        return IdeaResponse.from(ideaRepository.save(idea));
    }

    @Transactional
    public IdeaResponse addNotes(Long id, String notes) {
        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Idée introuvable"));
        idea.setNotes(notes);
        return IdeaResponse.from(ideaRepository.save(idea));
    }

    @Transactional
    public void delete(Long id) {
        ideaRepository.deleteById(id);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    private Subscription getSubscription(User user) {
        return subscriptionRepository.findByUser(user).orElseThrow();
    }

    private void checkQuota(Subscription sub) {
        if (sub.getPlan().isUnlimited()) return;

        resetQuotaIfNewDay(sub);

        int quota = sub.getPlan().getDailyIdeaQuota();
        int used = sub.getIdeasUsedToday();

        if (used >= quota) {
            throw new RuntimeException(
                    "Quota journalier atteint (" + quota +
                            " idées). Revenez demain ou passez au plan Pro !");
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

    private List<Idea> parseAndSaveIdeas(
            String aiResponse,
            IdeaGenerationRequest request,
            Project project
    ) {
        List<Idea> ideas = new ArrayList<>();

        try {
            String cleanJson = aiResponse
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();

            JsonNode root = objectMapper.readTree(cleanJson);
            JsonNode ideasNode = root.get("ideas");

            for (JsonNode node : ideasNode) {
                Idea idea = Idea.builder()
                        .title(node.get("title").asText())
                        .description(node.get("description").asText())
                        .platform(request.getPlatform())
                        .format(request.getFormat())
                        .status(IdeaStatus.SAVED)
                        .project(project)
                        .build();

                ideas.add(ideaRepository.save(idea));
            }
        } catch (Exception e) {
            log.error("Erreur parsing réponse IA : {}", e.getMessage());
            throw new RuntimeException("Erreur lors de la génération des idées");
        }

        return ideas;
    }
}