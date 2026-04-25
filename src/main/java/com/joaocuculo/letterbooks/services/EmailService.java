package com.joaocuculo.letterbooks.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

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
            String htmlContent = buildHtmlEmail(userName, resetLink);

            helper.setText(htmlContent, true);

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Erro ao enviar o e-mail.", e);
        }
    }

    private String buildHtmlEmail(String userName, String resetLink) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
                <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden;">
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 40px 40px 32px; text-align: center;">
                                        <div style="font-size: 36px; margin-bottom: 8px;">📚</div>
                                        <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.5px;">letterbooks</h1>
                                    </td>
                                </tr>
                                
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 0 40px 40px;">
                                        <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #1a1a1a;">Olá, %s!</h2>
                                        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #4a4a4a;">
                                            Recebemos uma solicitação para redefinir a senha da sua conta. 
                                            Clique no botão abaixo para criar uma nova senha:
                                        </p>
                                        
                                        <!-- Button -->
                                        <table width="100%%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td align="center" style="padding: 8px 0 24px;">
                                                    <a href="%s" style="display: inline-block; padding: 14px 32px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                                                        Redefinir senha
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #6a6a6a;">
                                            Ou copie e cole este link no seu navegador:
                                        </p>
                                        <p style="margin: 0 0 24px; padding: 12px; background-color: #f5f5f5; border-radius: 6px; font-size: 13px; color: #4a4a4a; word-break: break-all; font-family: monospace;">
                                            %s
                                        </p>
                                        
                                        <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #8a8a8a;">
                                            Este link expira em <strong>1 hora</strong>. 
                                            Se você não solicitou esta redefinição, ignore este e-mail.
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 24px 40px; background-color: #fafafa; text-align: center; border-top: 1px solid #e5e5e5;">
                                        <p style="margin: 0; font-size: 13px; color: #8a8a8a;">
                                            © 2025 Letterbooks. Todos os direitos reservados.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(userName, resetLink, resetLink);
    }
}
