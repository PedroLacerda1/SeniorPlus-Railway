package org.example.seniorplus.service;

import lombok.RequiredArgsConstructor;
import org.example.seniorplus.domain.CaregiverLinkStatus;
import org.example.seniorplus.domain.Cuidador;
import org.example.seniorplus.domain.Endereco;
import org.example.seniorplus.domain.Evento;
import org.example.seniorplus.domain.Idoso;
import org.example.seniorplus.domain.Medicamento;
import org.example.seniorplus.domain.Role;
import org.example.seniorplus.domain.Usuario;
import org.example.seniorplus.repository.CaregiverLinkRequestRepository;
import org.example.seniorplus.repository.EnderecoRepository;
import org.example.seniorplus.repository.EventoRepository;
import org.example.seniorplus.repository.IdosoRepository;
import org.example.seniorplus.repository.MedicamentoRepository;
import org.example.seniorplus.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ElderlyAccessService {
    private final UsuarioRepository usuarioRepository;
    private final IdosoRepository idosoRepository;
    private final EnderecoRepository enderecoRepository;
    private final CaregiverLinkRequestRepository caregiverLinkRequestRepository;
    private final EventoRepository eventoRepository;
    private final MedicamentoRepository medicamentoRepository;

    public String requireResidentAccess(String cpf, Principal principal) {
        String residentCpf = normalizeCpf(cpf);
        Usuario actor = requireActor(principal);
        String actorCpf = normalizeCpf(actor.getCpf());
        boolean allowed = actor.getRole() == Role.ROLE_ADMIN
                || (actor.getRole() == Role.ROLE_IDOSO && residentCpf.equals(actorCpf))
                || (actor.getRole() == Role.ROLE_CUIDADOR && isLinkedCaregiver(residentCpf, actorCpf));
        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não tem acesso aos dados deste idoso.");
        }
        return residentCpf;
    }

    public List<Idoso> listAccessibleResidents(Principal principal) {
        Usuario actor = requireActor(principal);
        if (actor.getRole() == Role.ROLE_ADMIN) return idosoRepository.findAll();
        if (actor.getRole() == Role.ROLE_IDOSO) {
            return idosoRepository.findById(normalizeCpf(actor.getCpf())).stream().toList();
        }
        if (actor.getRole() == Role.ROLE_CUIDADOR) {
            return idosoRepository.findByCuidadorCpf(normalizeCpf(actor.getCpf()));
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não tem acesso a esses dados.");
    }

    public void requireCaregiverAccess(String cpf, Principal principal) {
        Usuario actor = requireActor(principal);
        if (actor.getRole() == Role.ROLE_ADMIN) return;
        if (actor.getRole() == Role.ROLE_CUIDADOR && normalizeCpf(actor.getCpf()).equals(normalizeCpf(cpf))) return;
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não tem acesso a este cuidador.");
    }

    public void requireAdministrator(Principal principal) {
        if (requireActor(principal).getRole() != Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso administrativo obrigatório.");
        }
    }

    public String requireConsultationAccess(String cpf, Principal principal) {
        return requireResidentAccess(cpf, principal);
    }

    public String requireMedicalExamAccess(String cpf, Principal principal) {
        return requireResidentAccess(cpf, principal);
    }

    public void requireAddressAccess(Long addressId, Principal principal) {
        Endereco address = enderecoRepository.findById(Objects.requireNonNull(addressId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endereço não encontrado."));
        if (address.getIdosoCpf() != null && !address.getIdosoCpf().isBlank()) {
            requireResidentAccess(address.getIdosoCpf(), principal);
            return;
        }
        requireCaregiverAccess(address.getCuidadorCpf(), principal);
    }

    public void requireAddressOwner(Endereco address, Principal principal) {
        if (address.getIdosoCpf() != null && !address.getIdosoCpf().isBlank()) {
            requireResidentAccess(address.getIdosoCpf(), principal);
            return;
        }
        requireCaregiverAccess(address.getCuidadorCpf(), principal);
    }

    public void requireResidentCreation(String residentCpf, String caregiverCpf, Principal principal) {
        Usuario actor = requireActor(principal);
        if (actor.getRole() == Role.ROLE_ADMIN) return;

        String actorCpf = normalizeCpf(actor.getCpf());
        if (actor.getRole() == Role.ROLE_CUIDADOR) {
            if (caregiverCpf != null && normalizeCpf(caregiverCpf).equals(actorCpf)) return;
        } else if (actor.getRole() == Role.ROLE_IDOSO
                && normalizeCpf(residentCpf).equals(actorCpf)
                && (caregiverCpf == null || caregiverCpf.isBlank())) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode criar esse vínculo de idoso.");
    }

    public void requireCaregiverAssignment(String caregiverCpf, Principal principal) {
        if (caregiverCpf == null || caregiverCpf.isBlank()) return;
        Usuario actor = requireActor(principal);
        if (actor.getRole() == Role.ROLE_ADMIN) return;
        if (actor.getRole() == Role.ROLE_CUIDADOR
                && normalizeCpf(actor.getCpf()).equals(normalizeCpf(caregiverCpf))) return;
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode vincular este cuidador.");
    }

    @Transactional(readOnly = true)
    public void requireEventAccess(Long eventId, Principal principal) {
        Long id = Objects.requireNonNull(eventId, "ID do evento não pode ser nulo");
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado."));
        String cpf = evento.getIdoso() == null ? null : evento.getIdoso().getCpf();
        requireResidentAccess(cpf, principal);
    }

    public void requireMedicationAccess(Long medicationId, Principal principal) {
        Long id = Objects.requireNonNull(medicationId, "ID do medicamento não pode ser nulo");
        Medicamento medication = medicamentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicamento não encontrado."));
        requireResidentAccess(medication.getCpf(), principal);
    }

    private Usuario requireActor(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Autenticação obrigatória.");
        }
        return usuarioRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário autenticado não encontrado."));
    }

    private boolean isLinkedCaregiver(String residentCpf, String caregiverCpf) {
        if (residentCpf == null || caregiverCpf == null) return false;
        Idoso resident = idosoRepository.findById(residentCpf).orElse(null);
        Cuidador caregiver = resident == null ? null : resident.getCuidador();
        if (caregiver != null && caregiver.getCpf() != null
            && normalizeCpf(caregiver.getCpf()).equals(caregiverCpf)) return true;
        return caregiverLinkRequestRepository.findTopByIdosoCpfAndCuidadorCpfAndStatus(
                residentCpf, caregiverCpf, CaregiverLinkStatus.ACCEPTED).isPresent();
    }

    private @NonNull String normalizeCpf(String value) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF do idoso é obrigatório.");
        }
        String digits = value.replaceAll("\\D", "");
        if (digits.length() != 11) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF inválido.");
        }
        return digits;
    }
}
