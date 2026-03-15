package com.tank.armin.script;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scripts")
@RequiredArgsConstructor
public class ScriptController {

    private final ScriptService scriptService;

    @PostMapping("/generate")
    public ResponseEntity<ScriptResponse> generate(
            @RequestBody @Valid ScriptRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(scriptService.generate(request));
    }

    @PostMapping("/improve")
    public ResponseEntity<ScriptResponse> improve(
            @RequestBody @Valid ScriptImprovementRequest request) {
        return ResponseEntity.ok(scriptService.improve(request));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ScriptResponse>> getByProject(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(scriptService.getByProject(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScriptResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(scriptService.getById(id));
    }

    @PatchMapping("/{id}/content")
    public ResponseEntity<ScriptResponse> save(
            @PathVariable Long id,
            @RequestBody String content) {
        return ResponseEntity.ok(scriptService.save(id, content));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        scriptService.delete(id);
    }
}