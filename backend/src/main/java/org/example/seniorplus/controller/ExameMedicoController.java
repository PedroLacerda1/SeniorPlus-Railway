package org.example.seniorplus.controller;

import lombok.RequiredArgsConstructor;
import org.example.seniorplus.domain.ExameMedico;
import org.example.seniorplus.dto.ExameMedicoRequest;
import org.example.seniorplus.service.ElderlyAccessService;
import org.example.seniorplus.service.ExameMedicoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import java.net.URI;
import java.util.List;
import java.security.Principal;

@RestController
@RequestMapping(value = "/api/v1/exame")
@RequiredArgsConstructor
public class ExameMedicoController {

    private final ExameMedicoService service;
    private final ElderlyAccessService accessService;

    @GetMapping
    public ResponseEntity<List<ExameMedico>> listarTodos(Principal principal) {
        accessService.requireAdministrator(principal);
        List<ExameMedico> list = service.listarTodos();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping("/{cpf}")
    public ResponseEntity<ExameMedico> buscarPorCpf(@PathVariable String cpf, Principal principal) {
        ExameMedico obj = service.buscarPorCpf(accessService.requireMedicalExamAccess(cpf, principal));
        return ResponseEntity.ok().body(obj);
    }

    @PostMapping
    public ResponseEntity<Void> salvar(@RequestBody ExameMedicoRequest request, Principal principal) {
        accessService.requireMedicalExamAccess(request.cpf(), principal);
        ExameMedico obj = service.salvar(toEntity(request));
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{cpf}").buildAndExpand(obj.getCpf()).toUri();
        return ResponseEntity.created(uri).build();
    }

    @DeleteMapping("/{cpf}")
    public ResponseEntity<Void> deletar(@PathVariable String cpf, Principal principal) {
        service.buscarPorCpf(accessService.requireMedicalExamAccess(cpf, principal));
        service.deletar(cpf);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{cpf}")
    public ResponseEntity<ExameMedico> atualizar(@PathVariable String cpf, @RequestBody ExameMedicoRequest request, Principal principal) {
        accessService.requireMedicalExamAccess(cpf, principal);
        ExameMedico objAtualizado = service.atualizar(cpf, toEntity(request));
        return ResponseEntity.ok().body(objAtualizado);
    }

    private ExameMedico toEntity(ExameMedicoRequest request) {
        return new ExameMedico(request.cpf(), request.tipoExame(), request.resultado(), request.dataExame(),
                request.laboratorio(), request.observacoes());
    }
}
