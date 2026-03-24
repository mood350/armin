package com.tank.armin.admin;

import com.tank.armin.idea.IdeaRepository;
import com.tank.armin.project.ProjectRepository;
import com.tank.armin.script.ScriptRepository;
import com.tank.armin.subscription.Subscription;
import com.tank.armin.subscription.SubscriptionPlan;
import com.tank.armin.subscription.SubscriptionRepository;
import com.tank.armin.subscription.SubscriptionStatus;
import com.tank.armin.title.TitleRepository;
import com.tank.armin.user.User;
import com.tank.armin.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ProjectRepository projectRepository;
    private final IdeaRepository ideaRepository;
    private final ScriptRepository scriptRepository;
    private final TitleRepository titleRepository;

    public Page<AdminUserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(user -> {
            Subscription sub = subscriptionRepository.findByUser(user).orElse(null);
            SubscriptionPlan plan = sub != null ? sub.getPlan() : SubscriptionPlan.FREE;
            return AdminUserResponse.from(user, plan);
        });
    }

    public void toggleUserAccount(Long userId, boolean locked) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable"));
        user.setAccountLocked(locked);
        userRepository.save(user);
    }

    public void toggleUserEnabled(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable"));
        user.setEnabled(enabled);
        userRepository.save(user);
    }

    public AdminStatsResponse getStats() {
        List<User> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();

        long freeUsers = subscriptionRepository.findAll().stream()
                .filter(s -> s.getPlan() == SubscriptionPlan.FREE).count();
        long proUsers = subscriptionRepository.findAll().stream()
                .filter(s -> s.getPlan() == SubscriptionPlan.PRO).count();
        long businessUsers = subscriptionRepository.findAll().stream()
                .filter(s -> s.getPlan() == SubscriptionPlan.BUSINESS).count();

        long paidUsers = proUsers + businessUsers;
        double conversionRate = totalUsers > 0 ? (paidUsers * 100.0) / totalUsers : 0;

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(allUsers.stream().filter(User::isEnabled).count())
                .freeUsers(freeUsers)
                .proUsers(proUsers)
                .businessUsers(businessUsers)
                .totalProjects(projectRepository.count())
                .totalIdeas(ideaRepository.count())
                .totalScripts(scriptRepository.count())
                .totalTitles(titleRepository.count())
                .conversionRate(Math.round(conversionRate * 100.0) / 100.0)
                .build();
    }

    public void changePlan(Long userId, SubscriptionPlan plan) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable"));

        Subscription sub = subscriptionRepository.findByUser(user)
                .orElseGet(() -> {
                    Subscription newSub = Subscription.builder()
                            .user(user)
                            .plan(SubscriptionPlan.FREE)
                            .status(SubscriptionStatus.ACTIVE)
                            .startDate(LocalDateTime.now())
                            .ideasUsedToday(0)
                            .scriptsUsedToday(0)
                            .titlesUsedToday(0)
                            .build();
                    return subscriptionRepository.save(newSub);
                });

        sub.setPlan(plan);
        subscriptionRepository.save(sub);
    }
}