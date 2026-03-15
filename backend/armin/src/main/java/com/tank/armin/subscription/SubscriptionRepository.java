package com.tank.armin.subscription;

import com.tank.armin.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByUser(User user);
    Optional<Subscription> findByFedapayTransactionId(String transactionId);
}