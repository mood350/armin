package com.tank.armin.title;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/titles")
@RequiredArgsConstructor
public class TitleController {

    private final TitleService titleService;

    @PostMapping("/generate")
    public ResponseEntity<List<TitleResponse>> generate(
            @RequestBody @Valid TitleGenerationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(titleService.generate(request));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TitleResponse>> getByProject(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(titleService.getByProject(projectId));
    }

    @PatchMapping("/{id}/select")
    public ResponseEntity<TitleResponse> select(@PathVariable Long id) {
        return ResponseEntity.ok(titleService.select(id));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        titleService.delete(id);
    }
}