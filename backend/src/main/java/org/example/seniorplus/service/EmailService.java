package org.example.seniorplus.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Objects;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.springframework.lang.NonNull;
import org.springframework.beans.factory.annotation.Value;


@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.frontend-url:https://icy-rock-0cc47c010.5.azurestaticapps.net}")
    private String frontendUrl;

    public void enviarEmailResetSenha(@NonNull String destinatario,@NonNull String token) throws MessagingException {
        Context context = new Context();
        String baseUrl = frontendUrl.replaceAll("/+$", "");
        String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
        context.setVariable("resetUrl", baseUrl + "/resetar-senha?oobCode=" + encodedToken);
        String conteudo = templateEngine.process("reset-senha", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setTo(destinatario);
        helper.setSubject("Redefinição de Senha");
        helper.setText(Objects.requireNonNull(conteudo), true);
        
        mailSender.send(message);
    }
} 