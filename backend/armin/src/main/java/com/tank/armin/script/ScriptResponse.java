package com.tank.armin.script;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScriptResponse {

    private Long id;
    private String title;
    private String content;
    private ScriptTone tone;
    private int wordCount;
    private int estimatedDurationSeconds;
    private String estimatedDuration; // "3 min 20 sec"
    private List<ScriptVersionResponse> versions;
    private LocalDateTime createdAt;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScriptVersionResponse {
        private int versionNumber;
        private String content;
        private String changeDescription;
        private LocalDateTime createdAt;
    }

    public static ScriptResponse from(Script script) {
        int duration = script.getEstimatedDurationSeconds();
        String durationStr = (duration / 60) + " min " + (duration % 60) + " sec";

        List<ScriptVersionResponse> versions = script.getVersions()
                .stream()
                .map(v -> ScriptVersionResponse.builder()
                        .versionNumber(v.getVersionNumber())
                        .content(v.getContent())
                        .changeDescription(v.getChangeDescription())
                        .createdAt(v.getCreatedAt())
                        .build())
                .toList();

        return ScriptResponse.builder()
                .id(script.getId())
                .title(script.getTitle())
                .content(script.getContent())
                .tone(script.getTone())
                .wordCount(script.getWordCount())
                .estimatedDurationSeconds(duration)
                .estimatedDuration(durationStr)
                .versions(versions)
                .createdAt(script.getCreatedAt())
                .build();
    }
}