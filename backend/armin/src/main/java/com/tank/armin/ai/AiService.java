package com.tank.armin.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    @Value("${gemini.api.key}")
    private String geminiKey;

    @Value("${groq.api.key}")
    private String groqKey;

    public String generate(String prompt, AiProvider provider) {
        try {
            return switch (provider) {
                case GEMINI -> callGemini(prompt);
                case GROQ   -> callGroq(prompt);
            };
        } catch (Exception e) {
            log.warn("Provider {} échoué → fallback", provider, e);
            return switch (provider) {
                case GEMINI -> callGroq(prompt);
                case GROQ   -> callGemini(prompt);
            };
        }
    }

    private String callGemini(String prompt) {
        WebClient client = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text",
                                        "Tu es Armin, un assistant expert en création de contenu. " + prompt)
                        ))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.8,
                        "maxOutputTokens", 2048
                )
        );

        // ✅ String au lieu de JsonNode
        String response = client.post()
                .uri("/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiKey)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        // Parse manuellement avec org.json ou extraction simple
        return extractGeminiText(response);
    }

    private String callGroq(String prompt) {
        WebClient client = WebClient.builder()
                .baseUrl("https://api.groq.com")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + groqKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        Map<String, Object> body = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "Tu es Armin, un assistant expert en création de contenu."),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.8,
                "max_tokens", 2048
        );

        // ✅ String au lieu de JsonNode
        String response = client.post()
                .uri("/openai/v1/chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return extractGroqText(response);
    }

    /**
     * Extrait le texte de la réponse Gemini
     * {"candidates":[{"content":{"parts":[{"text":"..."}]}}]}
     */
    private String extractGeminiText(String json) {
        try {
            // Utilise ObjectMapper de tools.jackson (Jackson 3.x)
            tools.jackson.databind.ObjectMapper mapper = new tools.jackson.databind.ObjectMapper();
            tools.jackson.databind.JsonNode root = mapper.readTree(json);
            return root.get("candidates").get(0)
                    .get("content").get("parts").get(0)
                    .get("text").asText();
        } catch (Exception e) {
            throw new RuntimeException("Erreur parsing Gemini : " + e.getMessage());
        }
    }

    /**
     * Extrait le texte de la réponse Groq/OpenAI
     * {"choices":[{"message":{"content":"..."}}]}
     */
    private String extractGroqText(String json) {
        try {
            tools.jackson.databind.ObjectMapper mapper = new tools.jackson.databind.ObjectMapper();
            tools.jackson.databind.JsonNode root = mapper.readTree(json);
            return root.get("choices").get(0)
                    .get("message").get("content")
                    .asText();
        } catch (Exception e) {
            throw new RuntimeException("Erreur parsing Groq : " + e.getMessage());
        }
    }
}