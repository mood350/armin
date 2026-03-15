package com.tank.armin.title;

import com.tank.armin.project.Platform;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TitleResponse {

    private Long id;
    private String content;
    private int engagementScore;
    private int characterCount;
    private String keywords;
    private boolean selected;
    private String platformLimit; // "✅ OK" ou "⚠️ Trop long"
    private LocalDateTime createdAt;

    public static TitleResponse from(Title title, Platform platform) {
        int limit = switch (platform) {
            case YOUTUBE  -> 60;
            case LINKEDIN -> 150;
            default       -> 100;
        };

        String platformStatus = title.getCharacterCount() <= limit
                ? "✅ OK (" + title.getCharacterCount() + "/" + limit + ")"
                : "⚠️ Trop long (" + title.getCharacterCount() + "/" + limit + ")";

        return TitleResponse.builder()
                .id(title.getId())
                .content(title.getContent())
                .engagementScore(title.getEngagementScore())
                .characterCount(title.getCharacterCount())
                .keywords(title.getKeywords())
                .selected(title.isSelected())
                .platformLimit(platformStatus)
                .createdAt(title.getCreatedAt())
                .build();
    }
}