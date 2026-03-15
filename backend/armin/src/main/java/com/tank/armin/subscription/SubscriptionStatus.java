package com.tank.armin.subscription;

public enum SubscriptionStatus {
    ACTIVE,    // Abonnement actif
    PENDING,   // Paiement en attente
    CANCELLED, // Annulé par l'utilisateur
    EXPIRED    // Expiré (non renouvelé)
}