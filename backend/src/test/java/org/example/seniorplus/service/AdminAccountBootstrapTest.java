package org.example.seniorplus.service;

import org.example.seniorplus.domain.Role;
import org.example.seniorplus.domain.Usuario;
import org.example.seniorplus.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.ApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminAccountBootstrapTest {

    @Test
    void configuredEmailCollisionWithNonAdminFailsWithoutPromotingAccount() {
        UsuarioRepository repository = mock(UsuarioRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        Usuario existingAccount = new Usuario();
        existingAccount.setEmail("adm@seniorplus.com");
        existingAccount.setRole(Role.ROLE_CUIDADOR);
        when(repository.findByEmail("adm@seniorplus.com")).thenReturn(Optional.of(existingAccount));

        AdminAccountBootstrap bootstrap = new AdminAccountBootstrap(
                repository, passwordEncoder, "adm@seniorplus.com", "bootstrap-secret", "Admin");

        assertThrows(
                IllegalStateException.class,
                () -> bootstrap.run(mock(ApplicationArguments.class)));
        verify(repository, never()).save(existingAccount);
        verify(passwordEncoder, never()).encode("bootstrap-secret");
    }
}
