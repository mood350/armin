package com.tank.armin.admin;

import com.tank.armin.subscription.SubscriptionPlan;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Toutes les routes admin sont protégées par @PreAuthorize("hasRole('ADMIN')")
 * Seul un user avec ROLE_ADMIN peut accéder à ces endpoints.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // GET /api/admin/users?page=0&size=20
    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserResponse>> getAllUsers(
            Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllUsers(pageable));
    }

    // PATCH /api/admin/users/{id}/lock
    @PatchMapping("/users/{id}/lock")
    public ResponseEntity<Void> lockUser(@PathVariable Long userId) {
        adminService.toggleUserAccount(userId, true);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/admin/users/{id}/unlock
    @PatchMapping("/users/{id}/unlock")
    public ResponseEntity<Void> unlockUser(@PathVariable Long userId) {
        adminService.toggleUserAccount(userId, false);
        return ResponseEntity.noContent().build();
    }

    // GET /api/admin/stats
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    // PATCH /api/admin/users/{id}/plan
    @PatchMapping("/users/{id}/plan")
    public ResponseEntity<Void> changePlan(
            @PathVariable Long id,
            @RequestParam SubscriptionPlan plan) {
        adminService.changePlan(id, plan);
        return ResponseEntity.noContent().build();
    }
}