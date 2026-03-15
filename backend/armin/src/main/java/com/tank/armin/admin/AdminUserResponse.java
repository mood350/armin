package com.tank.armin.admin;

import com.tank.armin.subscription.SubscriptionPlan;
import com.tank.armin.user.User;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private boolean enabled;
    private boolean accountLocked;
    private SubscriptionPlan plan;
    private LocalDateTime createdAt;

    public static AdminUserResponse from(User user,
                                         SubscriptionPlan plan) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .enabled(user.isEnabled())
                .accountLocked(user.isAccountLocked())
                .plan(plan)
                .createdAt(user.getCreatedAt())
                .build();
    }
}