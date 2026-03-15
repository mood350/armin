package com.tank.armin.script;

import com.tank.armin.idea.Idea;
import org.springframework.stereotype.Component;

@Component
public class ScriptPromptBuilder {

    /**
     * Prompt pour générer un script depuis une idée.
     */
    public String buildGenerationPrompt(String title, ScriptTone tone,
                                        String platform, Idea idea) {
        return """
            Tu es un expert en création de scripts pour les réseaux sociaux.
            
            Génère un script complet et engageant pour le contenu suivant :
            
            TITRE : %s
            TON : %s
            PLATEFORME : %s
            %s
            
            STRUCTURE DU SCRIPT :
            - Introduction accrocheuse (hook) : 2-3 phrases
            - Développement structuré avec transitions claires
            - Call-to-action final engageant
            
            CONTRAINTES :
            - Adapté à la plateforme %s
            - Ton %s tout au long du script
            - Naturel et fluide à l'oral
            
            Réponds avec UNIQUEMENT le script, sans commentaires ni explications.
            """.formatted(
                title, tone.name(), platform,
                idea != null ? "IDÉE SOURCE : " + idea.getDescription() : "",
                platform, tone.name()
        );
    }

    /**
     * Prompt pour améliorer un script existant.
     */
    public String buildImprovementPrompt(
            String content,
            ScriptImprovementRequest.ImprovementAction action,
            ScriptTone newTone
    ) {
        String instruction = switch (action) {
            case REFORMULER ->
                    "Reformule ce script en gardant le même sens mais avec des formulations différentes.";
            case ALLONGER ->
                    "Allonge ce script en ajoutant plus de détails, d'exemples et d'explications.";
            case RACCOURCIR ->
                    "Raccourcis ce script en gardant uniquement les points essentiels.";
            case CHANGE_TONE ->
                    "Réécris ce script avec un ton " + newTone.name() + ".";
        };

        return """
            Tu es un expert en rédaction de scripts pour créateurs de contenu.
            
            %s
            
            SCRIPT ORIGINAL :
            %s
            
            Réponds avec UNIQUEMENT le script amélioré, sans commentaires.
            """.formatted(instruction, content);
    }
}