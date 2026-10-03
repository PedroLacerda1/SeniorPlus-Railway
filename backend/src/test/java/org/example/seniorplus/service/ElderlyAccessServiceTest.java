package org.example.seniorplus.service;

import org.example.seniorplus.domain.Cuidador;
import org.example.seniorplus.domain.Idoso;
import org.example.seniorplus.domain.Role;
import org.example.seniorplus.domain.Usuario;
import org.example.seniorplus.repository.CaregiverLinkRequestRepository;
import org.example.seniorplus.repository.ConsultaRepository;
import org.example.seniorplus.repository.EnderecoRepository;
import org.example.seniorplus.repository.EventoRepository;
import org.example.seniorplus.repository.ExameMedicoRepository;
import org.example.seniorplus.repository.IdosoRepository;
import org.example.seniorplus.repository.MedicamentoRepository;
import org.example.seniorplus.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ElderlyAccessServiceTest {
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private IdosoRepository idosoRepository;
    @Mock private CaregiverLinkRequestRepository caregiverLinkRequestRepository;
    @Mock private EventoRepository eventoRepository;
    @Mock private MedicamentoRepository medicamentoRepository;
    @Mock private EnderecoRepository enderecoRepository;
    @Mock private ConsultaRepository consultaRepository;
    @Mock private ExameMedicoRepository exameMedicoRepository;

    @InjectMocks
    private ElderlyAccessService accessService;

    @Test
    void elderlyUserCanAccessOnlyTheirOwnCpf() {
        Usuario user = user("idoso@example.com", "11122233344", Role.ROLE_IDOSO);
        when(usuarioRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        Principal principal = user::getEmail;

        assertEquals("11122233344", accessService.requireResidentAccess("111.222.333-44", principal));

        ResponseStatusException denied = assertThrows(ResponseStatusException.class,
                () -> accessService.requireResidentAccess("99988877766", principal));
        assertEquals(HttpStatus.FORBIDDEN, denied.getStatusCode());
    }

    @Test
    void caregiverCanAccessLinkedResidentButNotAnUnlinkedResident() {
        Usuario caregiverUser = user("caregiver@example.com", "22233344455", Role.ROLE_CUIDADOR);
        when(usuarioRepository.findByEmail(caregiverUser.getEmail())).thenReturn(Optional.of(caregiverUser));
        Principal principal = caregiverUser::getEmail;

        Idoso linkedResident = new Idoso();
        Cuidador caregiver = new Cuidador();
        caregiver.setCpf("22233344455");
        linkedResident.setCuidador(caregiver);
        when(idosoRepository.findById("11122233344")).thenReturn(Optional.of(linkedResident));
        when(idosoRepository.findById("99988877766")).thenReturn(Optional.empty());
        when(caregiverLinkRequestRepository.findTopByIdosoCpfAndCuidadorCpfAndStatus(
                org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any())).thenReturn(Optional.empty());

        assertEquals("11122233344", accessService.requireResidentAccess("11122233344", principal));

        ResponseStatusException denied = assertThrows(ResponseStatusException.class,
                () -> accessService.requireResidentAccess("99988877766", principal));
        assertEquals(HttpStatus.FORBIDDEN, denied.getStatusCode());
    }

    private Usuario user(String email, String cpf, Role role) {
        Usuario user = new Usuario();
        user.setEmail(email);
        user.setCpf(cpf);
        user.setRole(role);
        return user;
    }
}
