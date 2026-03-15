package com.tank.armin.admin;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {

    private long totalUsers;
    private long activeUsers;
    private long freeUsers;
    private long proUsers;
    private long businessUsers;
    private long totalProjects;
    private long totalIdeas;
    private long totalScripts;
    private long totalTitles;
    private double conversionRate; // % free → payant
}