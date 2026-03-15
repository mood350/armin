package com.tank.armin.idea;

import org.springframework.stereotype.Component;

/**
 * Construit les prompts pour la génération d'idées.
 * Séparé du service pour faciliter les tests et l'évolution.
 */
@Component
public class IdeaPromptBuilder {

    public String build(IdeaGenerationRequest request) {
        return """
            Tu es un expert en création de contenu pour les réseaux sociaux.
            
            Génère EXACTEMENT %d idées de contenu originales et engageantes.
            
            PARAMÈTRES :
            - Thème/Niche : %s
            - Audience cible : %s
            - Plateforme : %s
            - Format : %s
            
            INSTRUCTIONS :
            - Chaque idée doit avoir un titre accrocheur et une description courte (2-3 phrases)
            - Les idées doivent être adaptées à la plateforme %s
            - Pense aux tendances actuelles et aux sujets qui génèrent de l'engagement
            
            Réponds UNIQUEMENT en JSON valide avec ce format exact :
            {
              "ideas": [
                {
                  "title": "Titre de l'idée",
                  "description": "Description courte de l'idée en 2-3 phrases."
                }
              ]
            }
            """.formatted(
                request.getCount(),
                request.getTheme(),
                request.getAudience() != null ? request.getAudience() : "grand public",
                request.getPlatform().name(),
                request.getFormat() != null ? request.getFormat() : "tout format",
                request.getPlatform().name()
        );
    }
}