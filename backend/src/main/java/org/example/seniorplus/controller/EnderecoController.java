package org.example.seniorplus.controller;

import lombok.RequiredArgsConstructor;
import org.example.seniorplus.domain.Endereco;
import org.example.seniorplus.dto.EnderecoRequest;
import org.example.seniorplus.service.ElderlyAccessService;
import org.example.seniorplus.service.EnderecoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.security.Principal;

@RestController
@RequestMapping(value = "/endereco")
@RequiredArgsConstructor
public class EnderecoController {

    private final EnderecoService service;
    private final ElderlyAccessService accessService;

    @GetMapping
    public ResponseEntity<List<Endereco>> findAll(Principal principal) {
        accessService.requireAdministrator(principal);
        List<Endereco> list = service.getAllEndereco();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Endereco> findById(@PathVariable Long id, Principal principal) {
        accessService.requireAddressAccess(id, principal);
        Endereco obj = service.getEnderecoById(id);
        return ResponseEntity.ok().body(obj);
    }

    @PostMapping
    public ResponseEntity<Void> insert(@RequestBody EnderecoRequest request, Principal principal) {
        Endereco endereco = toEntity(request);
        accessService.requireAddressOwner(endereco, principal);
        Endereco obj = service.saveEndereco(endereco);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(obj.getId()).toUri();
        return ResponseEntity.created(uri).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        accessService.requireAddressAccess(id, principal);
        service.deleteEndereco(id);
        return ResponseEntity.noContent().build();
    }

    private Endereco toEntity(EnderecoRequest request) {
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


}
