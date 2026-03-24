package com.tank.armin.config;

import com.tank.armin.role.Role;
import com.tank.armin.role.RoleRepository;
import com.tank.armin.user.User;
import com.tank.armin.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        // Crée le rôle USER s'il n'existe pas
        roleRepository.findByRoleName("USER")
                .orElseGet(() -> roleRepository.save(
                        Role.builder().roleName("USER").build()
                ));

        createAdminIfNotExists();
    }

    private void createAdminIfNotExists() {
        if (userRepository.findByEmail("admin@armin.com").isPresent()) {
            return; // déjà créé
        }

        // Crée ou récupère le rôle ADMIN
        Role adminRole = roleRepository.findByRoleName("ADMIN")
                .orElseGet(() -> roleRepository.save(
                        Role.builder().roleName("ADMIN").build()
                ));

        User admin = User.builder()
                .firstName("Admin")
                .lastName("Armin")
                .email("admin@armin.com")
                .password(passwordEncoder.encode("admin1234"))
                .enabled(true)
                .accountLocked(false)
                .roles(List.of(adminRole))
                .build();

        userRepository.save(admin);
        log.info("✅ Admin par défaut créé : admin@armin.com");
    }
}