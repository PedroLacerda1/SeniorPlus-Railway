package org.example.seniorplus.service;

import lombok.RequiredArgsConstructor;
import org.example.seniorplus.domain.ExameMedico;
// no-op imports
import org.example.seniorplus.repository.ExameMedicoRepository;
import org.example.seniorplus.service.exception.ServiceOperationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ExameMedicoService {

    private final ExameMedicoRepository exameMedicoRepository;

    // Método para listar todos os medicamentos
    public List<ExameMedico> listarTodos() {
        return exameMedicoRepository.findAll();
    }

    // Método para buscar um medicamento por CPF
    public ExameMedico buscarPorCpf(String cpf) {
    return exameMedicoRepository.findByCpf(cpf)
        .orElseThrow(() -> new ServiceOperationException("Exame não encontrado com o CPF: " + cpf));
    }

    // Método para salvar um novo medicamento
    public ExameMedico salvar(ExameMedico exameMedico) {
        try {
            return exameMedicoRepository.save(Objects.requireNonNull(exameMedico));
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao salvar o medicamento: " + e.getMessage(), e);
        }
    }

    // Método para atualizar um exame existente
    public ExameMedico atualizar(String cpf, ExameMedico exameAtualizado) {
        ExameMedico existente = buscarPorCpf(cpf); // garante que existe
        try {
            // Propaga apenas campos mutáveis (mantém CPF como chave de busca nesta API)
            existente.setTipoExame(exameAtualizado.getTipoExame());
            existente.setResultado(exameAtualizado.getResultado());
            existente.setDataExame(exameAtualizado.getDataExame());
            existente.setLaboratorio(exameAtualizado.getLaboratorio());
            existente.setObservacoes(exameAtualizado.getObservacoes());

            return exameMedicoRepository.save(existente);
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao atualizar o exame com CPF: " + cpf + ". " + e.getMessage(), e);
        }
    }

    public void deletar(String cpf) {
        // garante que existe
        buscarPorCpf(cpf);
        try {
            exameMedicoRepository.deleteByCpf(cpf);
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao deletar o exame com CPF: " + cpf + ". " + e.getMessage(), e);
        }
    }

}
