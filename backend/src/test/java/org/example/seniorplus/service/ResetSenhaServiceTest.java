package org.example.seniorplus.service;

import org.example.seniorplus.repository.ResetSenhaTokenRepository;
import org.example.seniorplus.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class ResetSenhaServiceTest {

    private UsuarioRepository usuarioRepository;
    private ResetSenhaTokenRepository resetTokenRepository;
    private EmailService emailService;
    private ResetSenhaService service;

    @BeforeEach
    void setUp() {
        usuarioRepository = mock(UsuarioRepository.class);
        resetTokenRepository = mock(ResetSenhaTokenRepository.class);
        emailService = mock(EmailService.class);
        service = new ResetSenhaService(
                usuarioRepository, resetTokenRepository, emailService, mock(PasswordEncoder.class));
    }

    @Test
    void doesNotRevealWhetherAnAccountExistsWhenRequestingPasswordReset() {
        String email = "qa-no-such-user@example.invalid";
        when(usuarioRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> service.solicitarResetSenha(email));

        verify(usuarioRepository).findByEmail(email);
        verifyNoInteractions(resetTokenRepository, emailService);
    }
}
