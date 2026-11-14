package org.example.seniorplus.service;

import org.example.seniorplus.domain.Role;
import org.example.seniorplus.domain.Usuario;
import org.example.seniorplus.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CustomUserDetailsServiceTest {

    @Test
    void disabledAccountIsAlsoDisabledForExistingJwtAuthentication() {
        UsuarioRepository repository = mock(UsuarioRepository.class);
        Usuario account = new Usuario();
        account.setEmail("inactive@example.com");
        account.setSenha("encoded-password");
        account.setRole(Role.ROLE_CUIDADOR);
        account.setAtivo(false);
        when(repository.findByEmail("inactive@example.com")).thenReturn(Optional.of(account));

        var userDetails = new CustomUserDetailsService(repository).loadUserByUsername("inactive@example.com");

        assertFalse(userDetails.isEnabled());
    }

    @Test
    void activeAccountRemainsEnabled() {
        UsuarioRepository repository = mock(UsuarioRepository.class);
        Usuario account = new Usuario();
        account.setEmail("active@example.com");
        account.setSenha("encoded-password");
        account.setRole(Role.ROLE_IDOSO);
        account.setAtivo(true);
        when(repository.findByEmail("active@example.com")).thenReturn(Optional.of(account));

        var userDetails = new CustomUserDetailsService(repository).loadUserByUsername("active@example.com");

        assertTrue(userDetails.isEnabled());
    }
}
