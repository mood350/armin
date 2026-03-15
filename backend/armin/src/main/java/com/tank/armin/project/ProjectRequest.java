package com.tank.armin.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRequest {

    @NotBlank(message = "Le nom du projet est obligatoire")
    private String name;

    private String description;

    @NotNull(message = "La plateforme est obligatoire")
    private Platform platform;

    private String niche;
}