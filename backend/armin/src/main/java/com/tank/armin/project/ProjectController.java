package com.tank.armin.project;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    // POST /api/projects
    @PostMapping
    public ResponseEntity<ProjectResponse> create(
            @RequestBody @Valid ProjectRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(projectService.create(request));
    }

    // GET /api/projects
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getMyProjects() {
        return ResponseEntity.ok(projectService.getMyProjects());
    }

    // GET /api/projects/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getById(id));
    }

    // PUT /api/projects/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid ProjectRequest request) {
        return ResponseEntity.ok(projectService.update(id, request));
    }

    // PATCH /api/projects/{id}/archive
    @PatchMapping("/{id}/archive")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archive(@PathVariable Long id) {
        projectService.archive(id);
    }

    // DELETE /api/projects/{id}
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        projectService.delete(id);
    }

    // POST /api/projects/{id}/collaborators
    @PostMapping("/{id}/collaborators")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addCollaborator(
            @PathVariable Long id,
            @RequestParam String email) {
        projectService.addCollaborator(id, email);
    }

    // DELETE /api/projects/{id}/collaborators
    @DeleteMapping("/{id}/collaborators")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeCollaborator(
            @PathVariable Long id,
            @RequestParam String email) {
        projectService.removeCollaborator(id, email);
    }
}