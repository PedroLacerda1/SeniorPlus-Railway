package org.example.seniorplus.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.seniorplus.dto.AdminLinkResponse;
import org.example.seniorplus.dto.AdminUserRequest;
import org.example.seniorplus.dto.AdminUserResponse;
import org.example.seniorplus.dto.AdminUserStatusRequest;
import org.example.seniorplus.service.AdminUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminUserService adminUserService;

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> listarUsuarios() {
        return ResponseEntity.ok(adminUserService.listarUsuarios());
    }

    @PostMapping("/users")
    public ResponseEntity<AdminUserResponse> criarUsuario(@Valid @RequestBody AdminUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminUserService.criarUsuario(request));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<AdminUserResponse> atualizarUsuario(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserRequest request) {
        return ResponseEntity.ok(adminUserService.atualizarUsuario(id, request));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<AdminUserResponse> atualizarStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserStatusRequest request,
            Principal principal) {
        return ResponseEntity.ok(adminUserService.atualizarStatus(id, request.ativo(), principal.getName()));
    }

    @GetMapping("/links")
    public ResponseEntity<List<AdminLinkResponse>> listarVinculos() {
        return ResponseEntity.ok(adminUserService.listarVinculos());
    }
}
