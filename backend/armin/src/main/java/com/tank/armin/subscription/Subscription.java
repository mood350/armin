package com.tank.armin.subscription;

import com.tank.armin.user.User;
import com.tank.armin.utils.Listeners;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "")
@EntityListeners(AuditingEntityListener.class)
public class Subscription extends Listeners {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private SubscriptionPlan plan;

    @Enumerated(EnumType.STRING)
    private BillingCycle billingCycle; // MONTHLY ou YEARLY

    @Enumerated(EnumType.STRING)
    private SubscriptionStatus status; // ACTIVE, PENDING, CANCELLED, EXPIRED

    // Dates d'abonnement
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    // Référence FedaPay pour tracking
    private String fedapayTransactionId;
    private String fedapayCustomerId;

    // Quotas consommés aujourd'hui (reset chaque minuit)
    private int ideasUsedToday;
    private int scriptsUsedToday;
    private int titlesUsedToday;
    private LocalDateTime lastQuotaReset;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
