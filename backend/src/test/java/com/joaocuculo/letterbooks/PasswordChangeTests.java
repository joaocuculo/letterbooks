package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.dto.request.PasswordChangeRequestDTO;
import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.entities.enums.UserRole;
import com.joaocuculo.letterbooks.entities.enums.UserStatus;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.repositories.UserRepository;
import com.joaocuculo.letterbooks.services.UserService;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PasswordChangeTests {
    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"Ab1!xyz", "abcdefgh1!", "ABCDEFGH1!", "Abcdefgh!", "Abcdefgh1", "Abcdefg1 "})
    void rejectsMissingOrWeakNewPasswords(String password) {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            assertTrue(factory.getValidator().validate(new PasswordChangeRequestDTO("old", password))
                    .stream().anyMatch(error -> error.getPropertyPath().toString().equals("newPassword")));
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"Abcdef1!", "Árvore1!", "Leitura1🙂"})
    void acceptsStrongNewPasswordsAndLegacyCurrentPasswords(String password) {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            assertTrue(factory.getValidator().validate(new PasswordChangeRequestDTO("old", password)).isEmpty());
        }
    }

    @Test
    void rejectsMissingCurrentPasswordAndExcessiveCharacterLength() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            assertFalse(factory.getValidator().validate(new PasswordChangeRequestDTO("", "Leitura1!")).isEmpty());
            assertFalse(factory.getValidator().validate(new PasswordChangeRequestDTO("old", "Ab1!" + "a".repeat(69))).isEmpty());
        }
    }

    @Test
    void rejectsBcryptByteOverflowBeforeQueryingOrEncoding() {
        var repository = mock(UserRepository.class);
        var encoder = mock(PasswordEncoder.class);
        var service = new UserService(repository, encoder);
        var error = assertThrows(BusinessException.class, () -> service.changePassword(
                1L, new PasswordChangeRequestDTO("old", "Ab1!" + "á".repeat(35))));
        assertEquals("Senha muito longa. Use uma senha mais curta.", error.getMessage());
        verifyNoInteractions(repository, encoder);
    }

    @Test
    void rejectsWrongCurrentPasswordWithoutSaving() {
        var repository = mock(UserRepository.class);
        var encoder = mock(PasswordEncoder.class);
        var user = new User("Leitor", "leitor@example.com", "old-hash", UserRole.USER, UserStatus.ACTIVE);
        when(repository.findById(1L)).thenReturn(Optional.of(user));
        var error = assertThrows(BusinessException.class, () -> new UserService(repository, encoder)
                .changePassword(1L, new PasswordChangeRequestDTO("wrong", "Leitura1!")));
        assertEquals("Senha atual incorreta.", error.getMessage());
        verify(encoder, never()).encode(anyString());
        verify(repository, never()).save(any());
    }

    @Test
    void rejectsReusingCurrentPasswordWithoutSaving() {
        var repository = mock(UserRepository.class);
        var encoder = mock(PasswordEncoder.class);
        var user = new User("Leitor", "leitor@example.com", "old-hash", UserRole.USER, UserStatus.ACTIVE);
        when(repository.findById(1L)).thenReturn(Optional.of(user));
        when(encoder.matches("Leitura1!", "old-hash")).thenReturn(true);
        var error = assertThrows(BusinessException.class, () -> new UserService(repository, encoder)
                .changePassword(1L, new PasswordChangeRequestDTO("Leitura1!", "Leitura1!")));
        assertEquals("A nova senha deve ser diferente da senha atual.", error.getMessage());
        verify(encoder, never()).encode(anyString());
        verify(repository, never()).save(any());
    }

    @Test
    void encodesAndSavesNewPasswordWithoutChangingSessionVersion() {
        var repository = mock(UserRepository.class);
        var encoder = mock(PasswordEncoder.class);
        var user = new User("Leitor", "leitor@example.com", "old-hash", UserRole.USER, UserStatus.ACTIVE);
        var originalVersion = user.getTokenVersion();
        when(repository.findById(1L)).thenReturn(Optional.of(user));
        when(encoder.matches("old", "old-hash")).thenReturn(true);
        when(encoder.encode("Leitura1!")).thenReturn("new-hash");
        new UserService(repository, encoder).changePassword(1L, new PasswordChangeRequestDTO("old", "Leitura1!"));
        assertEquals("new-hash", user.getPassword());
        assertEquals(originalVersion, user.getTokenVersion());
        verify(repository).save(user);
    }
}
