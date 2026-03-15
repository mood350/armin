package com.tank.armin.subscription;

import lombok.Getter;

/**
 * Plans d'abonnement Armin.
 * Les prix sont en XOF (Franc CFA).
 *
 * Conversion indicative :
 *  9,99 EUR ≈ 6 550 XOF
 *  29,99 EUR ≈ 19 670 XOF
 */
@Getter
public enum SubscriptionPlan {

    FREE(0, 0,
            5, 3, 5, 3),

    PRO(6550, 65000,        // 6 550 XOF/mois, 65 000 XOF/an (~10% réduction)
            50, 30, 999, 10),

    BUSINESS(19670, 196700, // 19 670 XOF/mois, 196 700 XOF/an
            -1, -1, -1, -1);   // -1 = illimité

    private final int monthlyPriceXof;
    private final int yearlyPriceXof;

    // Quotas journaliers
    private final int dailyIdeaQuota;      // Idées / jour
    private final int dailyScriptQuota;    // Améliorations scripts / jour
    private final int dailyTitleQuota;     // Optimisations titres / jour
    private final int maxProjects;         // Projets actifs

    SubscriptionPlan(int monthlyPriceXof, int yearlyPriceXof,
                     int dailyIdeaQuota, int dailyScriptQuota,
                     int dailyTitleQuota, int maxProjects) {
        this.monthlyPriceXof = monthlyPriceXof;
        this.yearlyPriceXof = yearlyPriceXof;
        this.dailyIdeaQuota = dailyIdeaQuota;
        this.dailyScriptQuota = dailyScriptQuota;
        this.dailyTitleQuota = dailyTitleQuota;
        this.maxProjects = maxProjects;
    }

    public boolean isUnlimited() {
        return this == BUSINESS;
    }
}