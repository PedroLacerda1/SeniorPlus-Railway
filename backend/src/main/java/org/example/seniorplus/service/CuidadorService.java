package org.example.seniorplus.service;

import lombok.RequiredArgsConstructor;
import org.example.seniorplus.domain.Cuidador;
import org.example.seniorplus.service.exception.ObjectNotFoundException;
import org.example.seniorplus.service.exception.ServiceOperationException;
import org.example.seniorplus.repository.CuidadorRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CuidadorService {

    private final CuidadorRepository cuidadorRepository;

    // Buscar todos os cuidadores
    public List<Cuidador> buscarTodos() {
        try {
            return cuidadorRepository.findAll();
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao buscar lista de cuidadores: " + e.getMessage(), e);
        }
    }

    // Buscar cuidador por CPF
    public Cuidador buscarPorCpf(String cpf) {
        try {
            Optional<Cuidador> obj = cuidadorRepository.findById(Objects.requireNonNull(cpf));
            return obj.orElseThrow(() -> new ObjectNotFoundException("Cuidador não encontrado com CPF: " + cpf));
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao buscar cuidador com CPF: " + cpf + " - " + e.getMessage(), e);
        }
    }

    // Criar cuidador
    public Cuidador criar(Cuidador obj) {
        try {
            return cuidadorRepository.save(Objects.requireNonNull(obj));
        } catch (DataIntegrityViolationException e) {
            throw new ServiceOperationException("Erro de integridade ao salvar o cuidador: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao salvar o cuidador: " + e.getMessage(), e);
        }
    }

    // Deletar cuidador
    public void deletar(String cpf) {
        try {
            buscarPorCpf(cpf); // Garante que existe
            cuidadorRepository.deleteById(Objects.requireNonNull(cpf));
        } catch (ObjectNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao deletar cuidador com CPF: " + cpf + " - " + e.getMessage(), e);
        }
    }

    // Atualizar cuidador
    public Cuidador atualizar(String cpf, Cuidador novoCuidador) {
        try {
            Cuidador existente = buscarPorCpf(cpf);

            existente.setNome(novoCuidador.getNome());
            existente.setRg(novoCuidador.getRg());
            existente.setEmail(novoCuidador.getEmail());
            existente.setDataNascimento(novoCuidador.getDataNascimento());
            existente.setTelefone(novoCuidador.getTelefone());
            existente.getEnderecos().clear();
            existente.getEnderecos().addAll(novoCuidador.getEnderecos());

            return cuidadorRepository.save(existente);
        } catch (ObjectNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao atualizar cuidador com CPF: " + cpf + " - " + e.getMessage(), e);
        }
    }
}
