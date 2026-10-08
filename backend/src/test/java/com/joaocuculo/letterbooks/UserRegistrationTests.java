package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.config.JWTUserData;
import com.joaocuculo.letterbooks.dto.request.RegisterRequestDTO;
import com.joaocuculo.letterbooks.dto.request.UserProfileUpdateDTO;
import com.joaocuculo.letterbooks.dto.request.UserRequestDTO;
import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.entities.enums.UserRole;
import com.joaocuculo.letterbooks.entities.enums.UserStatus;
import com.joaocuculo.letterbooks.exceptions.BusinessException;
import com.joaocuculo.letterbooks.repositories.UserRepository;
import com.joaocuculo.letterbooks.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserRegistrationTests {
    private UserRepository repository;
    private PasswordEncoder encoder;
    private UserService service;

    @BeforeEach
    void configureService() {
        repository = mock(UserRepository.class);
        encoder = mock(PasswordEncoder.class);
        service = new UserService(repository, encoder);
    }

    @Test
    void rejectsMismatchedPasswordsBeforeQueryingOrSaving() {
        var dto = new RegisterRequestDTO("Leitor", "leitor@example.com", "Leitura1!", "OutraSenha1!");
        var error = assertThrows(BusinessException.class, () -> service.register(dto));
        assertEquals("As senhas devem ser iguais.", error.getMessage());
        verifyNoInteractions(repository, encoder);
    }

    @Test
    void rejectsMissingConfirmation() {
        assertThrows(BusinessException.class, () -> service.register(new RegisterRequestDTO("Leitor", "leitor@example.com", "Leitura1!", null)));
        verifyNoInteractions(repository, encoder);
    }

    @Test
    void rejectsPasswordsExceedingBcryptByteLimit() {
        String password = "Ab1!" + "á".repeat(35);
        var error = assertThrows(BusinessException.class, () -> service.register(new RegisterRequestDTO("Leitor", "leitor@example.com", password, password)));
        assertEquals("Senha muito longa. Use uma senha mais curta.", error.getMessage());
        verifyNoInteractions(repository, encoder);
    }

    @Test
    void rejectsDuplicateEmailBeforeEncodingOrSaving() {
        when(repository.existsByEmail("leitor@example.com")).thenReturn(true);
        var error = assertThrows(BusinessException.class, () -> service.register(new RegisterRequestDTO("Leitor", "leitor@example.com", "Leitura1!", "Leitura1!")));
        assertEquals("Este e-mail já está cadastrado.", error.getMessage());
        verifyNoInteractions(encoder);
        verify(repository, never()).save(any());
    }

    @Test
    void savesOnlyEncodedPasswordAndReturnsPublicData() {
        when(encoder.encode("Leitura1!")).thenReturn("encoded-password");
        var result = service.register(new RegisterRequestDTO("Leitor", "leitor@example.com", "Leitura1!", "Leitura1!"));
        var savedUser = ArgumentCaptor.forClass(User.class);
        verify(repository).save(savedUser.capture());
        assertEquals("encoded-password", savedUser.getValue().getPassword());
        assertEquals(UserRole.USER, savedUser.getValue().getRole());
        assertEquals(UserStatus.ACTIVE, savedUser.getValue().getStatus());
        assertEquals("leitor@example.com", result.email());
    }

    @Test
    void keepsUnchangedEmailAllowedWhenUpdatingUser() {
        User user = existingUser();
        when(repository.findById(1L)).thenReturn(Optional.of(user));
        service.update(1L, new UserRequestDTO("Novo nome", user.getEmail(), "unused"), new JWTUserData(1L, user.getEmail(), UserRole.USER, 0));
        verify(repository, never()).existsByEmail(any());
        verify(repository).save(user);
    }

    @Test
    void reusesDuplicateEmailValidationWhenUpdatingProfile() {
        when(repository.findById(1L)).thenReturn(Optional.of(existingUser()));
        when(encoder.matches("Atual1!", "encoded-password")).thenReturn(true);
        when(repository.existsByEmail("outro@example.com")).thenReturn(true);
        assertThrows(BusinessException.class, () -> service.updateProfile(1L, new UserProfileUpdateDTO("Leitor", "outro@example.com", "Atual1!")));
        verify(repository, never()).save(any());
    }

    private User existingUser() {
        User user = new User("Leitor", "leitor@example.com", "encoded-password", UserRole.USER, UserStatus.ACTIVE);
        ReflectionTestUtils.setField(user, "id", 1L);
        return user;
    }
}
