package com.tank.armin.subscription;

import com.tank.armin.fedapay.FedaPayService;
import com.tank.armin.user.User;
import com.tank.armin.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final FedaPayService fedaPayService;

    /**
     * Crée un abonnement FREE par défaut lors de l'inscription.
     * Appelé dans AuthenticationService.register()
     */
    public void createFreeSubscription(User user) {
        Subscription subscription = Subscription.builder()
                .plan(SubscriptionPlan.FREE)
                .status(SubscriptionStatus.ACTIVE)
                .billingCycle(BillingCycle.MONTHLY)
                .startDate(LocalDateTime.now())
                .endDate(null) // FREE n'expire pas
                .ideasUsedToday(0)
                .scriptsUsedToday(0)
                .titlesUsedToday(0)
                .lastQuotaReset(LocalDateTime.now())
                .user(user)
                .build();

        subscriptionRepository.save(subscription);
        log.info("Abonnement FREE créé pour {}", user.getEmail());
    }

    /**
     * Lance le processus d'upgrade vers Pro ou Business.
     * Retourne l'URL de paiement FedaPay.
     */
    public String initiateUpgrade(SubscriptionPlan plan, BillingCycle cycle) {
        // Récupère l'user connecté
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        // Détermine le montant
        int amount = cycle == BillingCycle.MONTHLY
                ? plan.getMonthlyPriceXof()
                : plan.getYearlyPriceXof();

        // Crée ou récupère le customer FedaPay
        Subscription subscription = subscriptionRepository
                .findByUser(user).orElseThrow();

        String customerId = subscription.getFedapayCustomerId();
        if (customerId == null) {
            customerId = fedaPayService.createCustomer(
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName()
            );
            subscription.setFedapayCustomerId(customerId);
            subscriptionRepository.save(subscription);
        }

        // Crée la transaction FedaPay
        String description = "Armin " + plan.name() + " - " + cycle.name();
        FedaPayService.FedaPayTransaction transaction =
                fedaPayService.createTransaction(amount, customerId, description);

        // Met le statut en PENDING
        subscription.setStatus(SubscriptionStatus.PENDING);
        subscription.setFedapayTransactionId(transaction.id());
        subscriptionRepository.save(subscription);

        // Retourne l'URL de paiement
        return fedaPayService.buildPaymentUrl(transaction.token());
    }

    /**
     * Active le plan après confirmation du paiement (webhook).
     */
    public void activatePlan(String transactionId) {
        Subscription subscription = subscriptionRepository
                .findByFedapayTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction introuvable"));

        // Vérifie le statut réel auprès de FedaPay
        String status = fedaPayService.getTransactionStatus(transactionId);

        if ("approved".equals(status)) {
            subscription.setStatus(SubscriptionStatus.ACTIVE);
            subscription.setStartDate(LocalDateTime.now());

            // Calcule la date de fin selon le cycle
            BillingCycle cycle = subscription.getBillingCycle();
            subscription.setEndDate(cycle == BillingCycle.MONTHLY
                    ? LocalDateTime.now().plusMonths(1)
                    : LocalDateTime.now().plusYears(1));

            subscriptionRepository.save(subscription);
            log.info("Plan {} activé pour transaction {}",
                    subscription.getPlan(), transactionId);
        }
    }

    /**
     * Vérifie si l'user peut encore générer des idées aujourd'hui.
     * Remet les compteurs à zéro si c'est un nouveau jour.
     */
    public boolean canGenerateIdea(User user) {
        Subscription sub = subscriptionRepository.findByUser(user).orElseThrow();
        resetQuotaIfNewDay(sub);

        if (sub.getPlan().isUnlimited()) return true;
        return sub.getIdeasUsedToday() < sub.getPlan().getDailyIdeaQuota();
    }

    public void incrementIdeaUsage(User user) {
        Subscription sub = subscriptionRepository.findByUser(user).orElseThrow();
        sub.setIdeasUsedToday(sub.getIdeasUsedToday() + 1);
        subscriptionRepository.save(sub);
    }

    /**
     * Remet les quotas à 0 si on est dans un nouveau jour.
     */
    private void resetQuotaIfNewDay(Subscription sub) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastReset = sub.getLastQuotaReset();

        if (lastReset == null || lastReset.toLocalDate().isBefore(now.toLocalDate())) {
            sub.setIdeasUsedToday(0);
            sub.setScriptsUsedToday(0);
            sub.setTitlesUsedToday(0);
            sub.setLastQuotaReset(now);
            subscriptionRepository.save(sub);
        }
    }
}