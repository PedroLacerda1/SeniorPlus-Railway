package org.example.seniorplus.controller;

import org.example.seniorplus.domain.Consulta;
import org.example.seniorplus.dto.ConsultaRequest;
import org.example.seniorplus.service.ElderlyAccessService;
import org.example.seniorplus.service.ConsultaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.security.Principal;

@RestController
@RequestMapping(value = "/api/v1/consulta")
@RequiredArgsConstructor
public class ConsultaController {

    private final ConsultaService service;
    private final ElderlyAccessService accessService;

    @GetMapping
    public ResponseEntity<List<Consulta>> buscarTodas(Principal principal) {
        accessService.requireAdministrator(principal);
        List<Consulta> list = service.buscarTodos();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping("/{cpf}")
    public ResponseEntity<Consulta> buscarPorId(@PathVariable String cpf, Principal principal) {
        Consulta obj = service.buscarPorCpf(accessService.requireConsultationAccess(cpf, principal));
        return ResponseEntity.ok().body(obj);
    }

    @PostMapping
    public ResponseEntity<Void> criar(@RequestBody ConsultaRequest request, Principal principal) {
        accessService.requireConsultationAccess(request.cpf(), principal);
        Consulta obj = service.criar(toEntity(request));
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(obj.getId()).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Consulta> atualizar(@PathVariable String id, @RequestBody ConsultaRequest request, Principal principal) {
        accessService.requireConsultationAccess(id, principal);
        Consulta objAtualizado = service.atualizar(id, toEntity(request));
        return ResponseEntity.ok().body(objAtualizado);
    }

    private Consulta toEntity(ConsultaRequest request) {
        Consulta consulta = new Consulta();
        consulta.setId(request.cpf());
        consulta.setNomeMedico(request.nomeMedico());
        consulta.setEspecialidade(request.especialidade());
        consulta.setData(request.data());
        consulta.setHora(request.hora());
        consulta.setLocal(request.local());
        consulta.setObservacoes(request.observacoes());
        consulta.setImgReceita(request.imgReceita());
        return consulta;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable String id, Principal principal) {
        service.buscarPorCpf(accessService.requireConsultationAccess(id, principal));
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
