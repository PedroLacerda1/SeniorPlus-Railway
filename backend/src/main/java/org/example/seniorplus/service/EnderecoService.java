package org.example.seniorplus.service;

import lombok.RequiredArgsConstructor;
import org.example.seniorplus.domain.Endereco;
import org.example.seniorplus.repository.EnderecoRepository;
import org.example.seniorplus.service.exception.ObjectNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;

    public List<Endereco> getAllEndereco() {
        return enderecoRepository.findAll();
    }
    public Endereco getEnderecoById(Long id) {
        return enderecoRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ObjectNotFoundException("Endereço não encontrado com ID: " + id));
    }

    public Endereco saveEndereco(Endereco obj) {
        return enderecoRepository.save(Objects.requireNonNull(obj));
    }

    public void deleteEndereco(Long id) {
        enderecoRepository.deleteById(Objects.requireNonNull(id));
    }
}
