package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserRequestDTO(
        @NotBlank(message = "Nome é obrigatório.")
        String name,
        @NotBlank(message = "E-mail é obrigatório.")
        @Email(message = "Deve ser um e-mail válido.")
        String email,
        // Senha atual; obrigatória apenas ao alterar o e-mail, validada no service.
        String password
) {
}
