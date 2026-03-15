package com.tank.armin.subscription;

import com.tank.armin.user.User;
import com.tank.armin.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;

    /**
     * Lance l'upgrade vers Pro ou Business.
     * Retourne l'URL de paiement FedaPay.
     *
     * POST /api/subscriptions/upgrade
     * Body : { "plan": "PRO", "cycle": "MONTHLY" }
     */
    @PostMapping("/upgrade")
    public ResponseEntity<Map<String, String>> upgrade(
            @RequestParam SubscriptionPlan plan,
            @RequestParam BillingCycle cycle
    ) {
        String paymentUrl = subscriptionService.initiateUpgrade(plan, cycle);
        return ResponseEntity.ok(Map.of("payment_url", paymentUrl));
    }

    /**
     * Retourne l'abonnement actuel de l'utilisateur connecté.
     */
    @GetMapping("/current")
    public ResponseEntity<Subscription> getCurrentSubscription() {

        // Récupère l'email de l'user connecté depuis le SecurityContext
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        // Charge l'user depuis la BDD
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User introuvable"));

        // Récupère son abonnement
        Subscription subscription = subscriptionRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Abonnement introuvable"));

        return ResponseEntity.ok(subscription);
    }
}