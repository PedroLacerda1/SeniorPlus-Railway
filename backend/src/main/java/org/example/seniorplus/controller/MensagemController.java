package org.example.seniorplus.controller;

import lombok.RequiredArgsConstructor;
import org.example.seniorplus.dto.MensagemRequest;
import org.example.seniorplus.dto.MensagemResponse;
import org.example.seniorplus.service.ElderlyAccessService;
import org.example.seniorplus.service.MensagemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.security.Principal;

@RestController
@RequestMapping("/api/v1/mensagens")
@RequiredArgsConstructor
public class MensagemController {
    
    private final MensagemService mensagemService;
    private final ElderlyAccessService accessService;

    @GetMapping
    public ResponseEntity<List<MensagemResponse>> getMensagensDoIdoso(
            @RequestParam(value = "idosoCpf", required = false) String cpf,
            @RequestParam(value = "idosoId", required = false) String id,
            Principal principal) {

        String authorizedCpf = accessService.requireResidentAccess(cpf != null ? cpf : id, principal);
        List<MensagemResponse> mensagens = mensagemService.getMensagensDoIdoso(authorizedCpf, null);
        return ResponseEntity.ok(mensagens);
    }

    @PostMapping
    public ResponseEntity<MensagemResponse> criarMensagem(@RequestBody MensagemRequest request, Principal principal) {
        String requestedCpf = request.getIdosoCpf() != null ? request.getIdosoCpf() : request.getIdosoId();
        String authorizedCpf = accessService.requireResidentAccess(requestedCpf, principal);
        request.setIdosoCpf(authorizedCpf);
        request.setIdosoId(null);
        request.setRemetente(principal.getName());
        request.setLida(false);
        MensagemResponse novaMensagem = mensagemService.salvarMensagem(request);
        return ResponseEntity.status(201).body(novaMensagem);
    }
}