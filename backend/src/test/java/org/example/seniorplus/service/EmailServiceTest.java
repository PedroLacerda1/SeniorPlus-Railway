package org.example.seniorplus.service;

import jakarta.mail.Session;
import jakarta.mail.Multipart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import org.thymeleaf.templatemode.TemplateMode;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EmailServiceTest {

    @Test
    void rendersResetEmailWithConfiguredFrontendUrlAndToken() throws Exception {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        MimeMessage message = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(message);

        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");

        TemplateEngine templateEngine = new SpringTemplateEngine();
        templateEngine.setTemplateResolver(resolver);

        EmailService emailService = new EmailService(mailSender, templateEngine);
        ReflectionTestUtils.setField(emailService, "frontendUrl", "https://test.example/");
        emailService.enviarEmailResetSenha("tester@example.com", "test-token");

        verify(mailSender).send(message);
        assertEquals("tester@example.com", message.getAllRecipients()[0].toString());
        MimeMultipart body = (MimeMultipart) message.getContent();
        String html = extractText(body);
        assertTrue(html.contains("https://test.example/resetar-senha?oobCode=test-token"), html);
    }

    private String extractText(Multipart multipart) throws Exception {
        StringBuilder text = new StringBuilder();
        for (int index = 0; index < multipart.getCount(); index++) {
            Object content = multipart.getBodyPart(index).getContent();
            if (content instanceof Multipart nested) {
                text.append(extractText(nested));
            } else if (content instanceof String value) {
                text.append(value);
            }
        }
        return text.toString();
    }
}
