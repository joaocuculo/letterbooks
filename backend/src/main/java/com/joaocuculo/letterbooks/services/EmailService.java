package com.joaocuculo.letterbooks.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetMail(String toEmail, String userName, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Recuperação de Senha - LetterBooks");

            String resetLink = frontendUrl + "/reset-password?token=" + token;
            String template = loadTemplate("email-password-reset.html");
            String html = template
                    .replace("{{userName}}", userName)
                    .replace("{{resetLink}}", resetLink);

            helper.setText(html, true);

            mailSender.send(message);

        } catch (MessagingException | IOException e) {
            throw new RuntimeException("Erro ao enviar e-mail.", e);
        }
    }

    private String loadTemplate(String fileName) throws IOException {
        ClassPathResource resource = new ClassPathResource("templates/" + fileName);
        return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    }
}
