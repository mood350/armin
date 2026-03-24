package com.tank.armin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<String> check() {
        // Retourne "UP" pour dire à Render que tout va bien
        return ResponseEntity.ok("UP");
    }
}