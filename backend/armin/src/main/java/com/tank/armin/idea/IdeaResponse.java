package com.tank.armin.idea;

import com.tank.armin.project.Platform;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IdeaResponse {

    private Long id;
    private String title;
    private String description;
    private String tags;
    private String notes;
    private Platform platform;
    private String format;
    private IdeaStatus status;
    private LocalDateTime createdAt;

    public static IdeaResponse from(Idea idea) {
        return IdeaResponse.builder()
                .id(idea.getId())
                .title(idea.getTitle())
                .description(idea.getDescription())
                .tags(idea.getTags())
                .notes(idea.getNotes())
                .platform(idea.getPlatform())
                .format(idea.getFormat())
                .status(idea.getStatus())
                .createdAt(idea.getCreatedAt())
                .build();
    }
}