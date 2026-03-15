package com.tank.armin.dashboard;

import com.tank.armin.idea.IdeaRepository;
import com.tank.armin.project.Project;
import com.tank.armin.project.ProjectRepository;
import com.tank.armin.script.ScriptRepository;
import com.tank.armin.subscription.Subscription;
import com.tank.armin.subscription.SubscriptionPlan;
import com.tank.armin.subscription.SubscriptionRepository;
import com.tank.armin.title.TitleRepository;
import com.tank.armin.user.User;
import com.tank.armin.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final IdeaRepository ideaRepository;
    private final ScriptRepository scriptRepository;
    private final TitleRepository titleRepository;
    private final SubscriptionRepository subscriptionRepository;

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public DashboardResponse getDashboard() {
        User user = getCurrentUser();
        Subscription sub = subscriptionRepository.findByUser(user).orElseThrow();

        // Projets accessibles
        List<Project> projects = projectRepository.findAllAccessibleByUser(user);

        // Stats globales
        long totalIdeas = projects.stream()
                .mapToLong(p -> ideaRepository.findByProjectOrderByCreatedAtDesc(p).size())
                .sum();

        long totalScripts = projects.stream()
                .mapToLong(p -> scriptRepository.findByProjectOrderByCreatedAtDesc(p).size())
                .sum();

        long totalTitles = projects.stream()
                .mapToLong(p -> titleRepository.findByProjectOrderByEngagementScoreDesc(p).size())
                .sum();

        // Quotas
        DashboardResponse.QuotaInfo ideaQuota = buildQuota(
                sub.getIdeasUsedToday(),
                sub.getPlan().getDailyIdeaQuota(),
                sub.getPlan().isUnlimited()
        );

        DashboardResponse.QuotaInfo scriptQuota = buildQuota(
                sub.getScriptsUsedToday(),
                sub.getPlan().getDailyScriptQuota(),
                sub.getPlan().isUnlimited()
        );

        DashboardResponse.QuotaInfo titleQuota = buildQuota(
                sub.getTitlesUsedToday(),
                sub.getPlan().getDailyTitleQuota(),
                sub.getPlan().isUnlimited()
        );

        // 3 derniers projets avec stats
        List<DashboardResponse.RecentProject> recentProjects = projects.stream()
                .limit(3)
                .map(p -> DashboardResponse.RecentProject.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .platform(p.getPlatform().name())
                        .ideaCount(ideaRepository
                                .findByProjectOrderByCreatedAtDesc(p).size())
                        .scriptCount(scriptRepository
                                .findByProjectOrderByCreatedAtDesc(p).size())
                        .build())
                .toList();

        // Activités récentes (5 dernières)
        List<DashboardResponse.RecentActivity> activities = projects.stream()
                .flatMap(p -> scriptRepository
                        .findByProjectOrderByCreatedAtDesc(p)
                        .stream()
                        .limit(2)
                        .map(s -> DashboardResponse.RecentActivity.builder()
                                .type("SCRIPT")
                                .title(s.getTitle())
                                .projectName(p.getName())
                                .createdAt(s.getCreatedAt().format(FORMATTER))
                                .build()))
                .limit(5)
                .toList();

        // Plan + expiration
        String planExpiresAt = sub.getEndDate() != null
                ? sub.getEndDate().format(FORMATTER)
                : "Pas d'expiration (FREE)";

        return DashboardResponse.builder()
                .totalProjects(projects.size())
                .totalIdeas(totalIdeas)
                .totalScripts(totalScripts)
                .totalTitles(totalTitles)
                .ideaQuota(ideaQuota)
                .scriptQuota(scriptQuota)
                .titleQuota(titleQuota)
                .currentPlan(sub.getPlan().name())
                .planExpiresAt(planExpiresAt)
                .recentActivities(activities)
                .recentProjects(recentProjects)
                .build();
    }

    private DashboardResponse.QuotaInfo buildQuota(
            int used, int limit, boolean unlimited) {

        if (unlimited) {
            return DashboardResponse.QuotaInfo.builder()
                    .used(used)
                    .limit(-1)
                    .remaining(-1)
                    .unlimited(true)
                    .percentage(0)
                    .build();
        }

        int remaining = Math.max(0, limit - used);
        int percentage = limit > 0 ? (used * 100) / limit : 0;

        return DashboardResponse.QuotaInfo.builder()
                .used(used)
                .limit(limit)
                .remaining(remaining)
                .unlimited(false)
                .percentage(Math.min(100, percentage))
                .build();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }
}