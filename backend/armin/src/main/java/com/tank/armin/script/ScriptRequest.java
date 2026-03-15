package com.tank.armin.script;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScriptRequest {

    @NotBlank(message = "Le titre est obligatoire")
    private String title;

    @NotNull(message = "Le projet est obligatoire")
    private Long projectId;

    private Long ideaId; // Optionnel — générer depuis une idée

    private String content; // Contenu manuel (si pas de génération IA)

    @NotNull(message = "Le ton est obligatoire")
    private ScriptTone tone;
}