package com.tank.armin.dashboard;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    // Stats globales
    private long totalProjects;
    private long totalIdeas;
    private long totalScripts;
    private long totalTitles;

    // Quotas du jour
    private QuotaInfo ideaQuota;
    private QuotaInfo scriptQuota;
    private QuotaInfo titleQuota;

    // Plan actuel
    private String currentPlan;
    private String planExpiresAt;

    // Activité récente
    private List<RecentActivity> recentActivities;

    // 3 derniers projets
    private List<RecentProject> recentProjects;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuotaInfo {
        private int used;
        private int limit;       // -1 = illimité
        private int remaining;
        private boolean unlimited;
        private int percentage;  // pour la jauge
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private String type;     // "IDEA", "SCRIPT", "TITLE"
        private String title;
        private String projectName;
        private String createdAt;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentProject {
        private Long id;
        private String name;
        private String platform;
        private long ideaCount;
        private long scriptCount;
    }
}