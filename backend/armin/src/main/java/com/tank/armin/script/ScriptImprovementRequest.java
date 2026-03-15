package com.tank.armin.script;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScriptImprovementRequest {

    @NotNull(message = "L'ID du script est obligatoire")
    private Long scriptId;

    @NotNull(message = "L'action est obligatoire")
    private ImprovementAction action;

    private ScriptTone newTone; // Pour l'action CHANGE_TONE

    public enum ImprovementAction {
        REFORMULER,    // Reformuler le script
        ALLONGER,      // Rendre plus long
        RACCOURCIR,    // Rendre plus court
        CHANGE_TONE    // Changer le ton
    }
}