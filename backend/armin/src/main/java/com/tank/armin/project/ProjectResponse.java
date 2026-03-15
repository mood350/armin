package com.tank.armin.project;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {

    private Long id;
    private String name;
    private String description;
    private Platform platform;
    private String niche;
    private boolean archived;
    private String ownerEmail;
    private LocalDateTime createdAt;

    public static ProjectResponse from(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .platform(project.getPlatform())
                .niche(project.getNiche())
                .archived(project.isArchived())
                .ownerEmail(project.getOwner().getEmail())
                .createdAt(project.getCreatedAt())
                .build();
    }
}