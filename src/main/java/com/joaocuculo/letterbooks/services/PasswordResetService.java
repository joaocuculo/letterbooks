package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.request.ForgotPasswordRequestDTO;
import com.joaocuculo.letterbooks.dto.request.ResetPasswordRequestDTO;
import com.joaocuculo.letterbooks.entities.PasswordReset;
import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.exceptions.ExpiredTokenException;
import com.joaocuculo.letterbooks.exceptions.InvalidTokenException;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import com.joaocuculo.letterbooks.repositories.PasswordResetRepository;
import com.joaocuculo.letterbooks.repositories.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final PasswordResetRepository passwordResetRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(PasswordResetRepository passwordResetRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.passwordResetRepository = passwordResetRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void requestReset(ForgotPasswordRequestDTO dto) {
        Optional<User> userOpt = userRepository.findByEmail(dto.email());

        if (userOpt.isEmpty()) {
            return;
        }

        User user = (User) userOpt.get();
        passwordResetRepository.deleteByUser(user);

        String tokenReset = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(1);

        PasswordReset passwordReset = new PasswordReset(tokenReset, expiresAt, user);
        passwordResetRepository.save(passwordReset);

        // send email
    }

    public void resetPassword(ResetPasswordRequestDTO dto) {
        PasswordReset passwordReset = passwordResetRepository.findPasswordResetByToken(dto.token())
                .orElseThrow(() -> new InvalidTokenException("Token incompatível."));
        if (passwordReset.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ExpiredTokenException("Token informado expirou.");
        }
        User user = passwordReset.getUser();
        user.setPassword(passwordEncoder.encode(dto.newPassword()));
        userRepository.save(user);

        passwordResetRepository.delete(passwordReset);
    }
}
