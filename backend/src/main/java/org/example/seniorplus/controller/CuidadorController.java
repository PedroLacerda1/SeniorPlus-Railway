package org.example.seniorplus.controller;

import lombok.RequiredArgsConstructor;
import org.example.seniorplus.domain.Cuidador;
import org.example.seniorplus.domain.Endereco;
import org.example.seniorplus.dto.CuidadorRequest;
import org.example.seniorplus.dto.EnderecoRequest;
import org.example.seniorplus.service.ElderlyAccessService;
import org.example.seniorplus.service.CuidadorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.security.Principal;

@RestController
@RequestMapping(value = "/api/v1/cuidador")
@RequiredArgsConstructor
public class CuidadorController {

    private final CuidadorService service;
    private final ElderlyAccessService accessService;

    @GetMapping
    public ResponseEntity<List<Cuidador>> buscarTodas(Principal principal) {
        accessService.requireAdministrator(principal);
        List<Cuidador> list = service.buscarTodos();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping("/{cpf}")
    public ResponseEntity<Cuidador> buscarPorId(@PathVariable String cpf, Principal principal) {
        accessService.requireCaregiverAccess(cpf, principal);
        Cuidador obj = service.buscarPorCpf(cpf);
        return ResponseEntity.ok().body(obj);
    }

    @PostMapping
    public ResponseEntity<Void> criar(@RequestBody CuidadorRequest request, Principal principal) {
        accessService.requireCaregiverAccess(request.cpf(), principal);
        Cuidador obj = service.criar(toEntity(request));
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{cpf}").buildAndExpand(obj.getCpf()).toUri();
        return ResponseEntity.created(uri).build();
    }

    @PutMapping("/{cpf}")
    public ResponseEntity<Cuidador> atualizar(@PathVariable String cpf, @RequestBody CuidadorRequest request, Principal principal) {
        accessService.requireCaregiverAccess(cpf, principal);
        Cuidador objAtualizado = service.atualizar(cpf, toEntity(request));
        return ResponseEntity.ok().body(objAtualizado);
    }

    private Cuidador toEntity(CuidadorRequest request) {
        Cuidador cuidador = new Cuidador(request.cpf(), request.rg(), request.nome(), request.email(),
            request.dataNascimento(), request.telefone());
        if (request.enderecos() != null) {
            for (EnderecoRequest endereco : request.enderecos()) {
                cuidador.getEnderecos().add(toEndereco(endereco));
            }
        }
        return cuidador;
    }

    private Endereco toEndereco(EnderecoRequest request) {
        Endereco endereco = new Endereco();
        endereco.setIdosoCpf(request.idosoCpf());
        endereco.setCuidadorCpf(request.cuidadorCpf());
        endereco.setRua(request.rua());
        endereco.setNumero(request.numero());
        endereco.setBairro(request.bairro());
        endereco.setCidade(request.cidade());
        endereco.setEstado(request.estado());
        endereco.setCep(request.cep());
        endereco.setComplemento(request.complemento());
        return endereco;
    }

    @DeleteMapping("/{cpf}")
    public ResponseEntity<Void> deletar(@PathVariable String cpf) {
        service.deletar(cpf);
        return ResponseEntity.noContent().build();
    }
}
