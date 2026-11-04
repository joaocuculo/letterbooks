package com.joaocuculo.letterbooks.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Year;

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
            int currentYear = Year.now().getValue();
            String template = loadTemplate("email-password-reset.html");
            String html = template
                    .replace("{{resetLink}}", HtmlUtils.htmlEscape(resetLink))
                    .replace("{{currentYear}}", String.valueOf(currentYear))
                    .replace("{{userName}}", HtmlUtils.htmlEscape(userName));

            String plainText = """
                    LetterBooks

                    Redefina sua senha

                    Olá, %s!

                    Recebemos uma solicitação para redefinir a senha da sua conta. Use o link abaixo para criar uma nova senha:

                    %s

                    Este link expira em 1 hora.

                    Se você não solicitou esta redefinição, ignore este e-mail. Sua senha permanecerá a mesma.

                    © %s LetterBooks
                    """.formatted(userName, resetLink, currentYear);

            helper.setText(plainText, html);
            helper.addInline("letterbooks-logo", new ClassPathResource("email/letterbooks-logo.png"), "image/png");

            mailSender.send(message);

        } catch (MessagingException | IOException e) {
            throw new RuntimeException("Erro ao enviar e-mail.", e);
        }
    }

    private String loadTemplate(String fileName) throws IOException {
        ClassPathResource resource = new ClassPathResource("templates/" + fileName);
        try (var stream = resource.getInputStream()) {
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
