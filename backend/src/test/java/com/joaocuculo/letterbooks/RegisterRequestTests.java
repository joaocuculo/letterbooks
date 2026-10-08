package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.dto.request.RegisterRequestDTO;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

class RegisterRequestTests {
    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void configureValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        factory.close();
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"Ab1!xyz", "abcdefgh1!", "ABCDEFGH1!", "Abcdefgh!", "Abcdefgh1", "Abcdefg1 "})
    void rejectsMissingOrWeakPasswords(String password) {
        var dto = new RegisterRequestDTO("Leitor", "leitor@example.com", password, "Confirmacao1!");
        assertTrue(validator.validate(dto).stream().anyMatch(error -> error.getPropertyPath().toString().equals("password")));
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" "})
    void confirmationIsRequired(String confirmation) {
        var dto = new RegisterRequestDTO("Leitor", "leitor@example.com", "Leitura1!", confirmation);
        assertTrue(validator.validate(dto).stream().anyMatch(error -> error.getPropertyPath().toString().equals("confirmPassword")));
    }

    @ParameterizedTest
    @ValueSource(strings = {"Abcdef1!", "Árvore1!", "Leitura1🙂"})
    void acceptsStrongPasswords(String password) {
        assertTrue(validator.validate(new RegisterRequestDTO("Leitor", "leitor@example.com", password, password)).isEmpty());
    }

    @Test
    void rejectsPasswordLongerThan72Characters() {
        String password = "Ab1!" + "a".repeat(69);
        assertFalse(validator.validate(new RegisterRequestDTO("Leitor", "leitor@example.com", password, password)).isEmpty());
    }
}
