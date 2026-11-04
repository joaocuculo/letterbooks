package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.services.EmailService;
import jakarta.mail.BodyPart;
import jakarta.mail.Message;
import jakarta.mail.Multipart;
import jakarta.mail.Part;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.util.HtmlUtils;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmailServiceTests {
    private static final String FRONTEND = "https://letterbooks.example";
    private static final String RECIPIENT = "leitor@example.test";
    private final JavaMailSender sender = mock(JavaMailSender.class);

    private EmailService service() {
        when(sender.createMimeMessage()).thenReturn(new MimeMessage(Session.getInstance(new Properties())));
        var service = new EmailService(sender);
        ReflectionTestUtils.setField(service, "fromEmail", "letterbooks@example.test");
        ReflectionTestUtils.setField(service, "frontendUrl", FRONTEND);
        return service;
    }

    private MimeMessage sentMessage() throws Exception {
        var capture = ArgumentCaptor.forClass(MimeMessage.class);
        verify(sender).send(capture.capture());
        capture.getValue().saveChanges();
        var bytes = new ByteArrayOutputStream();
        capture.getValue().writeTo(bytes);
        // Read the serialized message again, including transfer encoding and MIME boundaries.
        return new MimeMessage(Session.getInstance(new Properties()), new ByteArrayInputStream(bytes.toByteArray()));
    }

    private static List<Part> leafParts(Part part) throws Exception {
        var parts = new ArrayList<Part>();
        if (part.isMimeType("multipart/*")) {
            var multipart = (Multipart) part.getContent();
            for (int i = 0; i < multipart.getCount(); i++) parts.addAll(leafParts(multipart.getBodyPart(i)));
        } else parts.add(part);
        return parts;
    }

    private static Part find(List<Part> parts, String mimeType) throws Exception {
        for (var part : parts) if (part.isMimeType(mimeType)) return part;
        throw new AssertionError("Missing MIME part: " + mimeType);
    }

    @Test
    void sendsBrandedHtmlAndPlainTextWithEmbeddedLogo() throws Exception {
        service().sendPasswordResetMail(RECIPIENT, "João", "preview-only-not-a-valid-token");
        var message = sentMessage();
        assertEquals(RECIPIENT, message.getRecipients(Message.RecipientType.TO)[0].toString());
        assertEquals("letterbooks@example.test", message.getFrom()[0].toString());
        assertEquals("Recuperação de Senha - LetterBooks", message.getSubject());

        var parts = leafParts(message);
        assertEquals(3, parts.size());
        String html = (String) find(parts, "text/html").getContent();
        String text = (String) find(parts, "text/plain").getContent();
        var logo = find(parts, "image/png");
        assertEquals("<letterbooks-logo>", logo.getHeader("Content-ID")[0]);
        assertEquals(Part.INLINE, ((BodyPart) logo).getDisposition());
        try (var original = new ClassPathResource("email/letterbooks-logo.png").getInputStream();
             var embedded = logo.getInputStream()) {
            assertArrayEquals(original.readAllBytes(), embedded.readAllBytes());
        }
        assertTrue(html.contains("src=\"cid:letterbooks-logo\""));
        assertTrue(html.contains("alt=\"LetterBooks\""));
        assertTrue(html.contains("Crie uma nova senha para sua conta LetterBooks. O link expira em 1 hora."));
        assertFalse(html.contains("100%%"));
        assertFalse(html.contains("{{"));
        for (var body : List.of(HtmlUtils.htmlUnescape(html), text)) {
            assertTrue(body.contains("Olá, João!"));
            assertTrue(body.contains("Redefina sua senha"));
            assertTrue(body.contains("Sua senha permanecerá a mesma."));
            assertTrue(body.contains("© " + Year.now().getValue() + " LetterBooks"));
        }
        assertTrue(html.contains("1 hora</strong>"));
        assertTrue(text.contains("Este link expira em 1 hora."));

        // Optional artifacts for local review; no network or SMTP is used by this test.
        String previewDir = System.getProperty("letterbooks.email.preview-dir");
        if (previewDir != null) {
            var directory = Files.createDirectories(Path.of(previewDir));
            Files.writeString(directory.resolve("password-reset.html"), html, StandardCharsets.UTF_8);
            Files.writeString(directory.resolve("password-reset.txt"), text, StandardCharsets.UTF_8);
            try (var output = Files.newOutputStream(directory.resolve("password-reset.eml"))) {
                message.writeTo(output);
            }
        }
    }

    @Test
    void escapesHtmlAndKeepsBothLinksIdenticalAndPlainTextReadable() throws Exception {
        String name = "João & Maria <leitora> \"Árvore\"";
        String token = "preview-" + "a".repeat(180) + "&source=teste";
        String link = FRONTEND + "/reset-password?token=" + token;
        service().sendPasswordResetMail(RECIPIENT, name, token);
        var parts = leafParts(sentMessage());
        String html = (String) find(parts, "text/html").getContent();
        String text = (String) find(parts, "text/plain").getContent();
        assertTrue(html.contains(HtmlUtils.htmlEscape(name)));
        assertFalse(html.contains("<leitora>"));
        var matcher = Pattern.compile("href=\"([^\"]+)\"").matcher(html);
        var links = new ArrayList<String>();
        while (matcher.find()) links.add(HtmlUtils.htmlUnescape(matcher.group(1)));
        assertEquals(List.of(link, link), links);
        assertTrue(html.contains(">" + HtmlUtils.htmlEscape(link) + "</a>"));
        assertTrue(text.contains(name));
        assertTrue(text.contains(link));
        assertFalse(text.contains("&amp;"));
    }

    @Test
    void emailLogoHasWhiteBackgroundAndPreservesOfficialDimensions() throws Exception {
        try (var stream = new ClassPathResource("email/letterbooks-logo.png").getInputStream()) {
            var image = ImageIO.read(stream);
            assertEquals(740, image.getWidth());
            assertEquals(160, image.getHeight());
            assertFalse(image.getColorModel().hasAlpha());
            assertEquals(0xffffff, image.getRGB(0, 0) & 0xffffff);
            assertEquals(0xffffff, image.getRGB(739, 159) & 0xffffff);
        }
    }

    @Test
    void propagatesDeliveryFailureToExistingResetFlow() {
        var service = service();
        doThrow(new MailSendException("SMTP unavailable")).when(sender).send(any(MimeMessage.class));
        assertThrows(MailSendException.class,
                () -> service.sendPasswordResetMail(RECIPIENT, "Leitor", "preview-only"));
    }
}
