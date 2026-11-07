package org.example.seniorplus.controller;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PublicController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("status", "OK");
        payload.put("message", "Senior+ API online");
        payload.put("timestamp", OffsetDateTime.now().toString());
        return ResponseEntity.ok(payload);
    }

    @GetMapping({"/health", "/actuator/health"})
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("status", "UP");
        payload.put("timestamp", OffsetDateTime.now().toString());
        return ResponseEntity.ok(payload);
    }
}
