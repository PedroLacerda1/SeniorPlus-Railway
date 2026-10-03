package org.example.seniorplus.service;

import lombok.RequiredArgsConstructor;
import org.example.seniorplus.domain.Cuidador;
import org.example.seniorplus.domain.Idoso;
import org.example.seniorplus.domain.Role;
import org.example.seniorplus.domain.Usuario;
import org.example.seniorplus.repository.IdosoRepository;
import org.example.seniorplus.repository.CuidadorRepository;
import org.example.seniorplus.repository.UsuarioRepository;
import org.example.seniorplus.service.exception.ObjectNotFoundException;
import org.example.seniorplus.service.exception.ServiceOperationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IdosoService {

    private static final String CPF_IDOSO_NULO = "CPF do idoso não pode ser nulo";

    private final IdosoRepository repository;

    private final CuidadorRepository cuidadorRepository;

    private final UsuarioRepository usuarioRepository;

    public List<Idoso> buscarTodos() {
        try {
            return repository.findAll();
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao buscar lista de idosos: " + e.getMessage(), e);
        }
    }

    public List<Idoso> buscarPorCuidadorCpf(String cuidadorCpf) {
        try {
            return repository.findByCuidadorCpf(cuidadorCpf);
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao buscar idosos vinculados ao cuidador: " + cuidadorCpf + " - " + e.getMessage(), e);
        }
    }

    public Idoso buscarPorCpf(String cpf) {
        try {
            String cpfNormalizado = normalizarCpf(cpf);
            java.util.Objects.requireNonNull(cpfNormalizado, "CPF não pode ser nulo");
            Optional<Idoso> obj = repository.findById(cpfNormalizado);
            return obj.orElseThrow(() -> new ObjectNotFoundException("Usuário não encontrado com CPF: " + cpf));
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao buscar idoso com CPF: " + cpf + " - " + e.getMessage(), e);
        }
    }

    public Idoso criar(Idoso obj) {
        try {
            if (obj.getCuidador() != null && obj.getCuidador().getCpf() != null) {
                Cuidador cuidador = recuperarCuidador(obj.getCuidador().getCpf());
                obj.setCuidador(cuidador);
            }

            obj.refreshImc();
            return repository.save(obj);
        } catch (DataIntegrityViolationException e) {
            throw new ServiceOperationException("Erro de integridade ao salvar o idoso: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao salvar o idoso: " + e.getMessage(), e);
        }
    }

    public Idoso atualizar(String cpf, Idoso novoIdoso) {
        try {
            Idoso existente = buscarPorCpf(cpf);

            existente.setNome(novoIdoso.getNome());
            existente.setRg(novoIdoso.getRg());
            existente.setEmail(novoIdoso.getEmail());
            existente.setDataNascimento(novoIdoso.getDataNascimento());
            existente.setTelefone(novoIdoso.getTelefone());
            existente.setGenero(novoIdoso.getGenero());
            existente.setEstadoCivil(novoIdoso.getEstadoCivil());
            existente.setIdade(novoIdoso.getIdade());
            existente.setPeso(novoIdoso.getPeso());
            existente.setAltura(novoIdoso.getAltura());
            existente.setTipoSanguineo(novoIdoso.getTipoSanguineo());
            existente.setObservacao(novoIdoso.getObservacao());
            existente.setAlergias(novoIdoso.getAlergias());
            existente.setFotoUrl(novoIdoso.getFotoUrl());
            existente.setNomeContatoEmergencia(novoIdoso.getNomeContatoEmergencia());
            existente.setContatoEmergencia(novoIdoso.getContatoEmergencia());
            existente.getEnderecos().clear();
            if (novoIdoso.getEnderecos() != null) {
                existente.getEnderecos().addAll(novoIdoso.getEnderecos());
            }
            existente.setImc(novoIdoso.getImc());

            if (novoIdoso.getCuidador() != null && novoIdoso.getCuidador().getCpf() != null) {
                Cuidador cuidador = recuperarCuidador(novoIdoso.getCuidador().getCpf());
                existente.setCuidador(cuidador);
            } else if (novoIdoso.getCuidador() == null) {
                existente.setCuidador(null);
            }

            existente.refreshImc();

            return repository.save(existente);
        } catch (ObjectNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao atualizar idoso com CPF: " + cpf + " - " + e.getMessage(), e);
        }
    }

    public Idoso atribuirCuidador(String idosoCpf, String cuidadorCpf) {
        java.util.Objects.requireNonNull(idosoCpf, CPF_IDOSO_NULO);
        java.util.Objects.requireNonNull(cuidadorCpf, "CPF do cuidador não pode ser nulo");
        Idoso idoso = buscarPorCpf(idosoCpf);
        Cuidador cuidador = recuperarCuidador(cuidadorCpf);
        idoso.setCuidador(cuidador);
        return repository.save(idoso);
    }

    public Idoso removerCuidador(String idosoCpf) {
        java.util.Objects.requireNonNull(idosoCpf, CPF_IDOSO_NULO);
        Idoso idoso = buscarPorCpf(idosoCpf);
        idoso.setCuidador(null);
        return repository.save(idoso);
    }


    public void deletar(String cpf) {
        try {
            java.util.Objects.requireNonNull(cpf, "CPF não pode ser nulo");
            Idoso existente = buscarPorCpf(cpf); // garante que existe com CPF normalizado
            String cpfValido = java.util.Objects.requireNonNull(existente.getCpf(), CPF_IDOSO_NULO);
            repository.deleteById(cpfValido);
        } catch (ObjectNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceOperationException("Erro ao deletar idoso com CPF: " + cpf + " - " + e.getMessage(), e);
        }
    }

    private Cuidador recuperarCuidador(String cuidadorCpf) {
        java.util.Objects.requireNonNull(cuidadorCpf, "CPF do cuidador não pode ser nulo");
        String cpfNormalizado = normalizarCpf(cuidadorCpf);

        if (cpfNormalizado == null || cpfNormalizado.isBlank()) {
            throw new ObjectNotFoundException("CPF do cuidador inválido: " + cuidadorCpf);
        }

        Optional<Cuidador> existente = cuidadorRepository.findById(cpfNormalizado);
        if (existente.isPresent()) {
            return existente.get();
        }

        Usuario usuario = usuarioRepository.findByCpf(cpfNormalizado)
                .filter(u -> u.getRole() == Role.ROLE_CUIDADOR)
                .orElseThrow(() -> new ObjectNotFoundException("Cuidador não encontrado com CPF: " + cuidadorCpf));

        Cuidador novo = new Cuidador();
        novo.setCpf(usuario.getCpf());
        novo.setNome(Optional.ofNullable(usuario.getNome()).filter(n -> !n.isBlank()).orElse("Cuidador"));
        novo.setEmail(usuario.getEmail());
        return cuidadorRepository.save(novo);
    }

    private String normalizarCpf(String cpf) {
        if (cpf == null) {
            return null;
        }
        String apenasDigitos = cpf.replaceAll("\\D", "");
        if (apenasDigitos.length() == 11) {
            return apenasDigitos;
        }
        return cpf.trim();
    }
}
