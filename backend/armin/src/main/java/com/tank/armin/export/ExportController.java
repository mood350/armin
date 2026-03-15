package com.tank.armin.export;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;

    // GET /api/export/scripts/{id}/txt
    @GetMapping("/scripts/{id}/txt")
    public ResponseEntity<byte[]> exportTxt(@PathVariable Long id) {
        byte[] content = exportService.exportAsTxt(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"script-" + id + ".txt\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(content);
    }

    // GET /api/export/scripts/{id}/pdf
    @GetMapping("/scripts/{id}/pdf")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Long id) {
        byte[] content = exportService.exportAsPdf(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"script-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(content);
    }
}