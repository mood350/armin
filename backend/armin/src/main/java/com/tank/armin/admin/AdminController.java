package com.tank.armin.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // GET /api/admin/stats
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    // GET /api/admin/users
    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserResponse>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllUsers(pageable));
    }

    // PATCH /api/admin/users/{id}/lock
    @PatchMapping("/users/{id}/lock")
    public ResponseEntity<Void> lockUser(@PathVariable Long id) {
        adminService.toggleUserAccount(id, true);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/admin/users/{id}/unlock
    @PatchMapping("/users/{id}/unlock")
    public ResponseEntity<Void> unlockUser(@PathVariable Long id) {
        adminService.toggleUserAccount(id, false);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/admin/users/{id}/enable — Active le compte (email non confirmé)
    @PatchMapping("/users/{id}/enable")
    public ResponseEntity<Void> enableUser(@PathVariable Long id) {
        adminService.toggleUserEnabled(id, true);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/admin/users/{id}/disable — Désactive le compte
    @PatchMapping("/users/{id}/disable")
    public ResponseEntity<Void> disableUser(@PathVariable Long id) {
        adminService.toggleUserEnabled(id, false);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/admin/users/{id}/plan?plan=PRO
    @PatchMapping("/users/{id}/plan")
    public ResponseEntity<Void> changePlan(
            @PathVariable Long id,
            @RequestParam com.tank.armin.subscription.SubscriptionPlan plan) {
        adminService.changePlan(id, plan);
        return ResponseEntity.noContent().build();
    }
}