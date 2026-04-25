package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserRequestDTO(
        @NotBlank(message = "Nome é obrigatório.") String name,
        @NotBlank(message = "E-mail é obrigatório.") @Email(message = "Deve ser um e-mail válido.") String email,
        @NotBlank(message = "Senha é obrigatório.") @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres.") String password
) {
}
