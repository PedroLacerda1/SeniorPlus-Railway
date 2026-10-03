package org.example.seniorplus.service;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.example.seniorplus.domain.ResetSenhaToken;
import org.example.seniorplus.domain.Usuario;
import org.example.seniorplus.exception.AuthenticationException;
import org.example.seniorplus.repository.ResetSenhaTokenRepository;
import org.example.seniorplus.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ResetSenhaService {

    private final UsuarioRepository usuarioRepository;
    private final ResetSenhaTokenRepository resetTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Transactional(rollbackFor = MessagingException.class)
    public void solicitarResetSenha(String email) throws MessagingException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("Usuário não encontrado"));

        // Remove tokens antigos
        resetTokenRepository.deleteByUsuarioId(usuario.getId());

        // Gera novo token
        ResetSenhaToken resetToken = Objects.requireNonNull(ResetSenhaToken.gerarToken(usuario));
        resetTokenRepository.save(resetToken);

        // Envia email
        String usuarioEmail = Objects.requireNonNull(usuario.getEmail());
        String token = Objects.requireNonNull(resetToken.getToken());
        emailService.enviarEmailResetSenha(usuarioEmail, token);
    }

    @Transactional
    public void resetarSenha(String token, String novaSenha) {
        ResetSenhaToken resetToken = resetTokenRepository.findByToken(token)
                .orElseThrow(() -> new AuthenticationException("Token inválido"));

        if (resetToken.isExpirado()) {
            throw new AuthenticationException("Token expirado");
        }

        if (resetToken.isUtilizado()) {
            throw new AuthenticationException("Token já utilizado");
        }

        Usuario usuario = resetToken.getUsuario();
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);

        resetToken.setUtilizado(true);
        resetTokenRepository.save(resetToken);
    }
}