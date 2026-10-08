package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.dto.request.ResetPasswordRequestDTO;
import com.joaocuculo.letterbooks.entities.PasswordReset;
import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.entities.enums.UserRole;
import com.joaocuculo.letterbooks.entities.enums.UserStatus;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.exceptions.InvalidTokenException;
import com.joaocuculo.letterbooks.repositories.PasswordResetRepository;
import com.joaocuculo.letterbooks.repositories.UserRepository;
import com.joaocuculo.letterbooks.services.EmailService;
import com.joaocuculo.letterbooks.services.PasswordResetService;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ResetPasswordTests {
    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"Ab1!xyz", "abcdefgh1!", "ABCDEFGH1!", "Abcdefgh!", "Abcdefgh1", "Abcdefg1 "})
    void rejectsMissingOrWeakPasswords(String password) {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var dto = new ResetPasswordRequestDTO("test-token", password);
            assertTrue(factory.getValidator().validate(dto).stream()
                    .anyMatch(error -> error.getPropertyPath().toString().equals("newPassword")));
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"Abcdef1!", "Árvore1!", "Leitura1🙂"})
    void acceptsStrongPasswords(String password) {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            assertTrue(factory.getValidator().validate(new ResetPasswordRequestDTO("test-token", password)).isEmpty());
        }
    }

    @Test
    void rejectsMoreThan72Characters() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            assertFalse(factory.getValidator().validate(new ResetPasswordRequestDTO("test-token", "Ab1!" + "a".repeat(69))).isEmpty());
        }
    }

    @Test
    void rejectsMissingToken() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            assertFalse(factory.getValidator().validate(new ResetPasswordRequestDTO("", "Leitura1!")).isEmpty());
        }
    }

    @Test
    void rejectsBcryptByteOverflowBeforeUsingTokenOrEncoder() {
        var resets = mock(PasswordResetRepository.class);
        var users = mock(UserRepository.class);
        var encoder = mock(PasswordEncoder.class);
        var service = new PasswordResetService(resets, users, encoder, mock(EmailService.class));
        var error = assertThrows(BusinessException.class, () -> service.resetPassword(
                new ResetPasswordRequestDTO("test-token", "Ab1!" + "á".repeat(35))));
        assertEquals("Senha muito longa. Use uma senha mais curta.", error.getMessage());
        verifyNoInteractions(resets, users, encoder);
    }

    @Test
    void resetsPasswordAndInvalidatesSessionsAndResetLinks() {
        var resets = mock(PasswordResetRepository.class);
        var users = mock(UserRepository.class);
        var encoder = mock(PasswordEncoder.class);
        var user = new User("Leitor", "leitor@example.com", "old-hash", UserRole.USER, UserStatus.ACTIVE);
        var reset = new PasswordReset("hash", LocalDateTime.now().plusHours(1), user);
        when(resets.findByTokenHash(anyString())).thenReturn(Optional.of(reset));
        when(encoder.encode("Leitura1!")).thenReturn("new-hash");
        var version = user.getTokenVersion();
        var service = new PasswordResetService(resets, users, encoder, mock(EmailService.class));

        service.resetPassword(new ResetPasswordRequestDTO("test-token", "Leitura1!"));

        assertEquals("new-hash", user.getPassword());
        assertEquals(version + 1, user.getTokenVersion());
        verify(users).save(user);
        verify(resets).deleteByUser(user);
    }

    @Test
    void expiredTokenCannotChangePassword() {
        var resets = mock(PasswordResetRepository.class);
        var users = mock(UserRepository.class);
        var encoder = mock(PasswordEncoder.class);
        var user = new User("Leitor", "leitor@example.com", "old-hash", UserRole.USER, UserStatus.ACTIVE);
        var reset = new PasswordReset("hash", LocalDateTime.now().minusMinutes(1), user);
        when(resets.findByTokenHash(anyString())).thenReturn(Optional.of(reset));
        var service = new PasswordResetService(resets, users, encoder, mock(EmailService.class));

        assertThrows(InvalidTokenException.class, () -> service.resetPassword(new ResetPasswordRequestDTO("test-token", "Leitura1!")));

        verify(resets).delete(reset);
        verifyNoInteractions(users, encoder);
        assertEquals("old-hash", user.getPassword());
    }
}
