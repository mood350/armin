package com.tank.armin.idea;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ideas")
@RequiredArgsConstructor
public class IdeaController {

    private final IdeaService ideaService;

    // POST /api/ideas/generate
    @PostMapping("/generate")
    public ResponseEntity<List<IdeaResponse>> generate(
            @RequestBody @Valid IdeaGenerationRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ideaService.generate(request));
    }

    // GET /api/ideas/project/{projectId}
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<IdeaResponse>> getByProject(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(ideaService.getByProject(projectId));
    }

    // PATCH /api/ideas/{id}/status
    @PatchMapping("/{id}/status")
    public ResponseEntity<IdeaResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam IdeaStatus status) {
        return ResponseEntity.ok(ideaService.updateStatus(id, status));
    }

    // PATCH /api/ideas/{id}/notes
    @PatchMapping("/{id}/notes")
    public ResponseEntity<IdeaResponse> addNotes(
            @PathVariable Long id,
            @RequestBody String notes) {
        return ResponseEntity.ok(ideaService.addNotes(id, notes));
    }

    // DELETE /api/ideas/{id}
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        ideaService.delete(id);
    }
}