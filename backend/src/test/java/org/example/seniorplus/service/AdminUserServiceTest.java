package org.example.seniorplus.service;

import org.example.seniorplus.domain.Role;
import org.example.seniorplus.domain.Usuario;
import org.example.seniorplus.dto.AdminUserRequest;
import org.example.seniorplus.repository.CaregiverLinkRequestRepository;
import org.example.seniorplus.repository.CuidadorRepository;
import org.example.seniorplus.repository.IdosoRepository;
import org.example.seniorplus.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminUserServiceTest {

    private UsuarioRepository usuarioRepository;
    private IdosoRepository idosoRepository;
    private CuidadorRepository cuidadorRepository;
    private CaregiverLinkRequestRepository linkRepository;
    private PasswordEncoder passwordEncoder;
    private AdminUserService service;

    @BeforeEach
    void setUp() {
        usuarioRepository = mock(UsuarioRepository.class);
        idosoRepository = mock(IdosoRepository.class);
        cuidadorRepository = mock(CuidadorRepository.class);
        linkRepository = mock(CaregiverLinkRequestRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        service = new AdminUserService(
                usuarioRepository, idosoRepository, cuidadorRepository, linkRepository, passwordEncoder);
    }

    @Test
    void createsOnlyCaregiverOrElderlyAccountsAndEncodesPassword() {
        when(usuarioRepository.findByEmail("caregiver@example.com")).thenReturn(Optional.empty());
        when(usuarioRepository.findByCpf("12345678901")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("initial-password-123")).thenReturn("encoded-password");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.criarUsuario(new AdminUserRequest(
                "Caregiver", "Caregiver@Example.com", "123.456.789-01",
                Role.ROLE_CUIDADOR, "initial-password-123"));

        assertEquals("caregiver@example.com", response.email());
        assertEquals("12345678901", response.cpf());
        assertEquals(Role.ROLE_CUIDADOR, response.role());
        verify(passwordEncoder).encode("initial-password-123");
    }

    @Test
    void rejectsCreatingAnotherAdministratorThroughTheCrudEndpoint() {
        assertThrows(ResponseStatusException.class, () -> service.criarUsuario(new AdminUserRequest(
                "Admin", "admin@example.com", null, Role.ROLE_ADMIN, "initial-password-123")));
    }

    @Test
    void preventsDeactivatingTheLastActiveAdministrator() {
        Usuario admin = new Usuario();
        admin.setId(4L);
        admin.setEmail("admin@example.com");
        admin.setRole(Role.ROLE_ADMIN);
        admin.setAtivo(true);
        when(usuarioRepository.findById(4L)).thenReturn(Optional.of(admin));
        when(usuarioRepository.findAll()).thenReturn(List.of(admin));

        assertThrows(ResponseStatusException.class, () -> service.atualizarStatus(4L, false, "other-admin@example.com"));
    }
}
