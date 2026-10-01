package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.request.ForgotPasswordRequestDTO;
import com.joaocuculo.letterbooks.dto.request.ResetPasswordRequestDTO;
import com.joaocuculo.letterbooks.entities.PasswordReset;
import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.InvalidTokenException;
import com.joaocuculo.letterbooks.repositories.PasswordResetRepository;
import com.joaocuculo.letterbooks.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    private final PasswordResetRepository passwordResetRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public PasswordResetService(PasswordResetRepository passwordResetRepository, UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.passwordResetRepository = passwordResetRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public void requestReset(ForgotPasswordRequestDTO dto) {
        Optional<User> userOpt = userRepository.findByEmail(dto.email().trim());

        if (userOpt.isEmpty()) {
            return;
        }

        User user = userOpt.get();
        passwordResetRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(1);

        PasswordReset passwordReset = new PasswordReset(hashToken(token), expiresAt, user);
        passwordResetRepository.save(passwordReset);

        try {
            emailService.sendPasswordResetMail(user.getEmail(), user.getName(), token);
        } catch (RuntimeException e) {
            passwordResetRepository.delete(passwordReset);
            log.error("Não foi possível enviar o e-mail de recuperação de senha para o usuário {}.", user.getId(), e);
        }
    }

    @Transactional(dontRollbackOn = InvalidTokenException.class)
    public void resetPassword(ResetPasswordRequestDTO dto) {
        PasswordReset passwordReset = passwordResetRepository.findByTokenHash(hashToken(dto.token()))
                .orElseThrow(this::invalidResetToken);

        if (passwordReset.getExpiresAt().isBefore(LocalDateTime.now())) {
            passwordResetRepository.delete(passwordReset);
            throw invalidResetToken();
        }

        User user = passwordReset.getUser();

        if (passwordEncoder.matches(dto.newPassword(), user.getPassword())) {
            throw new BusinessException("A nova senha deve ser diferente da senha atual.");
        }

        user.setPassword(passwordEncoder.encode(dto.newPassword()));
        user.incrementTokenVersion();
        userRepository.save(user);

        passwordResetRepository.deleteByUser(user);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Não foi possível proteger o token de recuperação.", e);
        }
    }

    private InvalidTokenException invalidResetToken() {
        return new InvalidTokenException("Link de recuperação inválido ou expirado.");
    }
}
