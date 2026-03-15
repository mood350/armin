package com.tank.armin.idea;

import com.tank.armin.project.Platform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IdeaGenerationRequest {

    @NotNull(message = "Le projet est obligatoire")
    private Long projectId;

    @NotBlank(message = "Le thème est obligatoire")
    private String theme; // ex: "Intelligence Artificielle"

    private String niche;    // ex: "Tech grand public"
    private String audience; // ex: "Débutants 18-35 ans"

    @NotNull(message = "La plateforme est obligatoire")
    private Platform platform;

    private String format;   // ex: "tutoriel", "shorts", "vlog"

    // Nombre d'idées à générer (max 10)
    private int count = 5;
}