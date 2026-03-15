package com.tank.armin.fedapay;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                  FedaPayService.java                        ║
 * ║         Communication avec l'API REST FedaPay               ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * FedaPay n'a pas de SDK Java officiel.
 * On utilise WebClient (Spring WebFlux) pour les appels REST.
 *
 * FLUX DE PAIEMENT FEDAPAY :
 *  1. On crée un "customer" FedaPay (ou on récupère l'existant)
 *  2. On crée une "transaction" avec le montant et le customer
 *  3. FedaPay retourne un token de paiement
 *  4. On construit l'URL de paiement Mobile Money
 *  5. L'user paie → FedaPay envoie un webhook → on active le plan
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FedaPayService {

    @Value("${fedapay.api.secret-key}")
    private String secretKey;

    @Value("${fedapay.api.base-url}")
    private String baseUrl;

    @Value("${fedapay.callback-url}")
    private String callbackUrl;

    private WebClient buildClient() {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + secretKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * Crée un customer FedaPay pour l'utilisateur.
     * Retourne l'ID du customer créé.
     */
    public String createCustomer(String email, String firstName, String lastName) {
        Map<String, Object> body = Map.of(
                "firstname", firstName,
                "lastname", lastName,
                "email", email
        );

        JsonNode response = buildClient()
                .post()
                .uri("/v1/customers")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        return response.get("v1/customer").get("id").asText();
    }

    /**
     * Crée une transaction FedaPay.
     * Retourne le token de paiement pour construire l'URL.
     *
     * @param amountXof      Montant en XOF
     * @param customerId     ID customer FedaPay
     * @param description    Description de la transaction
     * @return               FedaPayTransaction (id + token)
     */
    public FedaPayTransaction createTransaction(
            int amountXof,
            String customerId,
            String description
    ) {
        Map<String, Object> body = Map.of(
                "description", description,
                "amount", amountXof,
                "currency", Map.of("iso", "XOF"),
                "callback_url", callbackUrl,
                "customer", Map.of("id", customerId)
        );

        JsonNode response = buildClient()
                .post()
                .uri("/v1/transactions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        JsonNode transaction = response.get("v1/transaction");
        String transactionId = transaction.get("id").asText();
        String token = transaction.get("token").asText();

        log.info("Transaction FedaPay créée : id={}", transactionId);

        return new FedaPayTransaction(transactionId, token);
    }

    /**
     * Construit l'URL de paiement Mobile Money.
     * L'user est redirigé vers cette URL pour payer.
     */
    public String buildPaymentUrl(String token) {
        return "https://checkout.fedapay.com/" + token;
    }

    /**
     * Récupère le statut d'une transaction.
     * Utilisé pour vérifier le paiement côté webhook.
     */
    public String getTransactionStatus(String transactionId) {
        JsonNode response = buildClient()
                .get()
                .uri("/v1/transactions/" + transactionId)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        return response.get("v1/transaction").get("status").asText();
    }

    // Record simple pour retourner id + token
    public record FedaPayTransaction(String id, String token) {}
}