package com.tank.armin.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    public record ErrorResponse(
            String code,
            String message,
            Map<String, String> details,
            String path,
            LocalDateTime timestamp
    ) {
        public ErrorResponse(String code, String message, String path) {
            this(code, message, new HashMap<>(), path, LocalDateTime.now());
        }

        public ErrorResponse(String code, String message,
                             Map<String, String> details, String path) {
            this(code, message, details, path, LocalDateTime.now());
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  SÉCURITÉ — AUTHENTIFICATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * 401 — Mauvais email ou mot de passe
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex, HttpServletRequest request) {
        log.warn("Tentative de connexion échouée : {}", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(
                        "BAD_CREDENTIALS",
                        "Email ou mot de passe incorrect",
                        request.getRequestURI()
                ));
    }

    /**
     * 403 — Compte désactivé (email non confirmé)
     * Vu dans les logs : DisabledException: User is disabled
     */
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ErrorResponse> handleDisabledAccount(
            DisabledException ex, HttpServletRequest request) {
        log.warn("Connexion refusée — compte désactivé : {}", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(
                        "ACCOUNT_DISABLED",
                        "Votre compte n'est pas encore activé. Vérifiez votre email.",
                        request.getRequestURI()
                ));
    }

    /**
     * 403 — Compte verrouillé (trop de tentatives ou lock admin)
     */
    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ErrorResponse> handleLockedAccount(
            LockedException ex, HttpServletRequest request) {
        log.warn("Connexion refusée — compte verrouillé : {}", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(
                        "ACCOUNT_LOCKED",
                        "Votre compte a été verrouillé. Contactez l'administrateur.",
                        request.getRequestURI()
                ));
    }

    /**
     * 404 — Utilisateur introuvable
     */
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUsernameNotFound(
            UsernameNotFoundException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(
                        "USER_NOT_FOUND",
                        ex.getMessage(),
                        request.getRequestURI()
                ));
    }

    /**
     * 403 — Accès refusé (pas les droits)
     * Vu dans les logs : AccessDeniedException: Seul le propriétaire peut effectuer cette action
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(
                        "ACCESS_DENIED",
                        ex.getMessage() != null ? ex.getMessage()
                                : "Vous n'avez pas les droits pour cette action",
                        request.getRequestURI()
                ));
    }

    // ═══════════════════════════════════════════════════════════════
    //  RESSOURCES
    // ═══════════════════════════════════════════════════════════════

    /**
     * 404 — Entité introuvable (orElseThrow EntityNotFoundException)
     */
    @ExceptionHandler(jakarta.persistence.EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(
            jakarta.persistence.EntityNotFoundException ex,
            HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(
                        "ENTITY_NOT_FOUND",
                        ex.getMessage() != null ? ex.getMessage() : "Ressource introuvable",
                        request.getRequestURI()
                ));
    }

    /**
     * 404 — NoSuchElementException (orElseThrow() sans message)
     * Vu dans les logs : NoSuchElementException: No value present
     * Causes : subscription manquante, dashboard admin sans subscription
     */
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ErrorResponse> handleNoSuchElement(
            NoSuchElementException ex, HttpServletRequest request) {
        log.error("Élément introuvable sur {} : {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(
                        "RESOURCE_NOT_FOUND",
                        "La ressource demandée est introuvable",
                        request.getRequestURI()
                ));
    }

    // ═══════════════════════════════════════════════════════════════
    //  MÉTIER — VALIDATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * 400 — Erreurs de validation des champs (@NotBlank, @Email, @Size...)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> details = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            details.put(fieldName, errorMessage);
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        "VALIDATION_ERROR",
                        "Les données envoyées sont invalides",
                        details,
                        request.getRequestURI()
                ));
    }

    /**
     * 400/403 — Exceptions métier (quota dépassé, déjà collaborateur,
     *           token expiré, plan insuffisant, etc.)
     * Vu dans les logs : RuntimeException pour quota, collaboration, tokens
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntime(
            RuntimeException ex, HttpServletRequest request) {

        String message = ex.getMessage();
        log.warn("RuntimeException sur {} : {}", request.getRequestURI(), message);

        // Quota dépassé → 429 Too Many Requests
        if (message != null && (message.contains("Limite") || message.contains("quota")
                || message.contains("atteinte"))) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new ErrorResponse(
                            "QUOTA_EXCEEDED",
                            message,
                            request.getRequestURI()
                    ));
        }

        // Plan insuffisant pour la collaboration → 403
        if (message != null && (message.contains("Pro") || message.contains("Business")
                || message.contains("collaboration"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(
                            "PLAN_REQUIRED",
                            message,
                            request.getRequestURI()
                    ));
        }

        // Déjà collaborateur → 409 Conflict
        if (message != null && message.contains("déjà collaborateur")) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(
                            "ALREADY_COLLABORATOR",
                            message,
                            request.getRequestURI()
                    ));
        }

        // Token expiré / invalide → 400
        if (message != null && (message.contains("Token") || message.contains("token")
                || message.contains("expiré") || message.contains("invalide"))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(
                            "INVALID_TOKEN",
                            message,
                            request.getRequestURI()
                    ));
        }

        // Refresh token invalide → 401
        if (message != null && message.contains("Refresh token")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(
                            "INVALID_REFRESH_TOKEN",
                            message,
                            request.getRequestURI()
                    ));
        }

        // Fallback → 400 Bad Request pour les RuntimeException inconnues
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        "BAD_REQUEST",
                        message != null ? message : "Requête invalide",
                        request.getRequestURI()
                ));
    }

    // ═══════════════════════════════════════════════════════════════
    //  FALLBACK — Toutes les autres exceptions
    // ═══════════════════════════════════════════════════════════════

    /**
     * 500 — Exception non gérée
     * On log mais on ne retourne jamais les détails techniques
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(
            Exception ex, HttpServletRequest request) {
        log.error("Erreur interne non gérée sur {} : {}", request.getRequestURI(),
                ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(
                        "INTERNAL_ERROR",
                        "Une erreur interne est survenue",
                        request.getRequestURI()
                ));
    }
}