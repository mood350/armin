package com.tank.armin.export;

import com.tank.armin.script.Script;
import com.tank.armin.script.ScriptRepository;
import com.tank.armin.subscription.Subscription;
import com.tank.armin.subscription.SubscriptionPlan;
import com.tank.armin.subscription.SubscriptionRepository;
import com.tank.armin.user.User;
import com.tank.armin.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                  ExportService.java                         ║
 * ║     Export des scripts en TXT (Free) et PDF (Pro/Business)  ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * FREE     → Export TXT uniquement
 * PRO/BUSINESS → Export TXT + PDF
 */
@Service
@RequiredArgsConstructor
public class ExportService {

    private final ScriptRepository scriptRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;

    /**
     * Export en texte brut (.txt)
     * Disponible pour tous les plans.
     */
    public byte[] exportAsTxt(Long scriptId) {
        Script script = getScript(scriptId);

        String content = """
                %s
                %s
                
                %s
                
                ---
                Généré par Armin — %s
                Durée estimée : %s
                """.formatted(
                script.getTitle(),
                "=".repeat(script.getTitle().length()),
                script.getContent(),
                java.time.LocalDate.now(),
                formatDuration(script.getEstimatedDurationSeconds())
        );

        return content.getBytes(StandardCharsets.UTF_8);
    }

    /**
     * Export en PDF.
     * Réservé aux plans Pro et Business.
     * Utilise iText — ajouter la dépendance dans pom.xml.
     */
    public byte[] exportAsPdf(Long scriptId) {
        User user = getCurrentUser();
        Subscription sub = subscriptionRepository.findByUser(user).orElseThrow();

        // Vérifie le plan
        if (sub.getPlan() == SubscriptionPlan.FREE) {
            throw new AccessDeniedException(
                    "L'export PDF est réservé aux plans Pro et Business");
        }

        Script script = getScript(scriptId);

        // Génération PDF avec iText
        try {
            com.itextpdf.kernel.pdf.PdfWriter writer =
                    new com.itextpdf.kernel.pdf.PdfWriter(
                            new java.io.ByteArrayOutputStream());
            com.itextpdf.kernel.pdf.PdfDocument pdf =
                    new com.itextpdf.kernel.pdf.PdfDocument(writer);
            com.itextpdf.layout.Document document =
                    new com.itextpdf.layout.Document(pdf);

            // Titre
            document.add(new com.itextpdf.layout.element.Paragraph(
                    script.getTitle())
                    .setFontSize(20)
                    .setBold());

            // Métadonnées
            document.add(new com.itextpdf.layout.element.Paragraph(
                    "Durée estimée : " +
                            formatDuration(script.getEstimatedDurationSeconds()))
                    .setFontSize(10)
                    .setItalic());

            document.add(new com.itextpdf.layout.element.Paragraph("\n"));

            // Contenu
            document.add(new com.itextpdf.layout.element.Paragraph(
                    script.getContent())
                    .setFontSize(12));

            // Footer
            document.add(new com.itextpdf.layout.element.Paragraph(
                    "\n\nGénéré par Armin — " + java.time.LocalDate.now())
                    .setFontSize(9)
                    .setItalic());

            document.close();

            java.io.ByteArrayOutputStream baos =
                    new java.io.ByteArrayOutputStream();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF");
        }
    }

    private Script getScript(Long id) {
        return scriptRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Script introuvable"));
    }

    private String formatDuration(int seconds) {
        return (seconds / 60) + " min " + (seconds % 60) + " sec";
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }
}