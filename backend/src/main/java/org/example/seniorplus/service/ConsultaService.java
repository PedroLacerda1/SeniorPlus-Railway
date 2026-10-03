package org.example.seniorplus.service;

import lombok.RequiredArgsConstructor;
import org.example.seniorplus.domain.Consulta;
import org.example.seniorplus.repository.ConsultaRepository;
import org.example.seniorplus.service.exception.ObjectNotFoundException;
import org.example.seniorplus.service.exception.ServiceOperationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ConsultaService {

    private final ConsultaRepository repository;

    public List<Consulta> buscarTodos() {
        try {
            return repository.findAll();
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao buscar lista de consultas: " + e.getMessage(), e);
        }
    }

    public Consulta buscarPorCpf(String cpf) {
        try {
            Optional<Consulta> obj = repository.findByCpf(cpf);
            return obj.orElseThrow(() -> new ObjectNotFoundException("Consulta não encontrada com CPF: " + cpf));
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao buscar consulta com CPF: " + cpf + " - " + e.getMessage(), e);
        }
    }

    public Consulta criar(Consulta obj) {
        try {
            return repository.save(Objects.requireNonNull(obj));
        } catch (DataIntegrityViolationException e) {
            throw new ServiceOperationException("Erro de integridade ao salvar a consulta: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao salvar a consulta: " + e.getMessage(), e);
        }
    }

    public void deletar(String cpf) {
        try {
            buscarPorCpf(cpf); // garante que existe
            repository.deleteByCpf(cpf);
        } catch (ObjectNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao deletar consulta com CPF: " + cpf + " - " + e.getMessage(), e);
        }
    }

    public Consulta atualizar(String cpf, Consulta novaConsulta) {
        try {
            // Buscar o objeto existente no banco de
            Consulta existente = buscarPorCpf(cpf);

            // Atualizar os campos do objeto existente com os dados novos
            existente.setNomeMedico(novaConsulta.getNomeMedico());
            existente.setEspecialidade(novaConsulta.getEspecialidade());
            existente.setData(novaConsulta.getData());
            existente.setHora(novaConsulta.getHora());
            existente.setLocal(novaConsulta.getLocal());
            existente.setObservacoes(novaConsulta.getObservacoes());
            existente.setImgReceita(novaConsulta.getImgReceita());

            // Salvar a consulta atualizada no banco de dados
            return repository.save(existente);
        } catch (ObjectNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao atualizar consulta com CPF: " + cpf + " - " + e.getMessage(), e);
        }
    }
}
