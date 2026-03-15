package com.tank.armin.subscription;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Reçoit les notifications de paiement de FedaPay.
 * FedaPay appelle ce endpoint après chaque événement de paiement.
 *
 * ⚠️ Cette route doit être publique dans SecurityConfig !
 */
@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    private final SubscriptionService subscriptionService;

    @PostMapping("/fedapay")
    public ResponseEntity<Void> handleFedaPayWebhook(
            @RequestBody Map<String, Object> payload
    ) {
        log.info("Webhook FedaPay reçu : {}", payload);

        String eventType = (String) payload.get("name");
        Map<String, Object> entity = (Map<String, Object>) payload.get("entity");
        String transactionId = String.valueOf(entity.get("id"));

        // On traite uniquement les paiements approuvés
        if ("transaction.approved".equals(eventType)) {
            subscriptionService.activatePlan(transactionId);
        }

        return ResponseEntity.ok().build();
    }
}