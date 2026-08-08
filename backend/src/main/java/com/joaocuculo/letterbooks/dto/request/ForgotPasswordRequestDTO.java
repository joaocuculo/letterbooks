package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequestDTO(
        @NotBlank(message = "E-mail é obrigatório.") @Email(message = "Deve ser um e-mail válido.") String email
) {
}
