package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserRequestDTO(
        @NotBlank(message = "Username é obrigatório.") String name,
        @NotBlank(message = "E-mail é obrigatório.") @Email(message = "Deve ser um e-mail válido.") String email,
        @NotBlank(message = "Senha é obrigatório.") String password
) {
}
