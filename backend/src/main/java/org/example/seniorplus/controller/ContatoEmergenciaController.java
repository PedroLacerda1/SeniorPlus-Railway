package org.example.seniorplus.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.example.seniorplus.domain.ContatoEmergencia;
import org.example.seniorplus.dto.ContatoEmergenciaRequest;
import org.example.seniorplus.service.ElderlyAccessService;
import org.example.seniorplus.service.ContatoEmergenciaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/v1/idosos/{cpf}/contatos-emergencia")
@RequiredArgsConstructor
public class ContatoEmergenciaController {

    private final ContatoEmergenciaService service;
    private final ElderlyAccessService accessService;

    @GetMapping
    public ResponseEntity<List<ContatoEmergencia>> listar(@PathVariable String cpf, Principal principal) {
        return ResponseEntity.ok(service.listarPorCpf(accessService.requireResidentAccess(cpf, principal)));
    }

    @PostMapping
    public ResponseEntity<ContatoEmergencia> criar(@PathVariable String cpf, @RequestBody ContatoEmergenciaRequest request, Principal principal) {
        ContatoEmergencia salvo = service.salvar(accessService.requireResidentAccess(cpf, principal), toEntity(request));
        return ResponseEntity.status(201).body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContatoEmergencia> atualizar(
            @PathVariable String cpf,
            @PathVariable Long id,
            @RequestBody ContatoEmergenciaRequest request,
            Principal principal) {
        return ResponseEntity.ok(service.atualizar(accessService.requireResidentAccess(cpf, principal), id, toEntity(request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable String cpf, @PathVariable Long id, Principal principal) {
        service.remover(accessService.requireResidentAccess(cpf, principal), id);
        return ResponseEntity.noContent().build();
    }

    private ContatoEmergencia toEntity(ContatoEmergenciaRequest request) {
        ContatoEmergencia contato = new ContatoEmergencia();
        contato.setNome(request.nome());
        contato.setTelefone(request.telefone());
        contato.setRelacao(request.relacao());
        contato.setObservacoes(request.observacoes());
        return contato;
    }
}
