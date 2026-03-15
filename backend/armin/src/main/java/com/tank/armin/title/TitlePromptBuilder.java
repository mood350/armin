package com.tank.armin.title;

import com.tank.armin.project.Platform;
import org.springframework.stereotype.Component;

@Component
public class TitlePromptBuilder {

    public String build(TitleGenerationRequest request) {
        int charLimit = switch (request.getPlatform()) {
            case YOUTUBE  -> 60;
            case LINKEDIN -> 150;
            default       -> 100;
        };

        return """
            Tu es un expert SEO et en création de contenu pour les réseaux sociaux.
            
            Génère EXACTEMENT %d variantes de titres optimisés pour ce contenu.
            
            PARAMÈTRES :
            - Sujet : %s
            - Mots-clés cibles : %s
            - Plateforme : %s
            - Limite de caractères : %d caractères max
            
            CRITÈRES DE QUALITÉ :
            - Accrocheur et qui donne envie de cliquer
            - Inclut les mots-clés naturellement
            - Respecte la limite de %d caractères
            - Adapté aux algorithmes de %s
            - Varie les structures (question, chiffre, liste, intrigue...)
            
            Pour chaque titre, fournis un score d'engagement de 0 à 100
            basé sur : lisibilité, mots-clés, longueur et potentiel de clic.
            
            Réponds UNIQUEMENT en JSON valide :
            {
              "titles": [
                {
                  "content": "Le titre ici",
                  "score": 85,
                  "keywords": "mot1, mot2, mot3"
                }
              ]
            }
            """.formatted(
                request.getCount(),
                request.getSubject(),
                request.getKeywords() != null ? request.getKeywords() : "automatique",
                request.getPlatform().name(),
                charLimit, charLimit,
                request.getPlatform().name()
        );
    }
}