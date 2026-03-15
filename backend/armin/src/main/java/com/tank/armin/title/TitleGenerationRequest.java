package com.tank.armin.title;

import com.tank.armin.project.Platform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TitleGenerationRequest {

    @NotNull(message = "Le projet est obligatoire")
    private Long projectId;

    private Long scriptId; // Optionnel — générer depuis un script

    @NotBlank(message = "Le sujet est obligatoire")
    private String subject; // Sujet du contenu

    private String keywords; // Mots-clés SEO cibles

    @NotNull(message = "La plateforme est obligatoire")
    private Platform platform;

    // Nombre de variantes (max 10)
    private int count = 10;
}