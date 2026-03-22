package com.tank.armin.project;

import com.tank.armin.user.User;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CollaboratorResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;

    public static CollaboratorResponse from(User user) {
        return CollaboratorResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }
}