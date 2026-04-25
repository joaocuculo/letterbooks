package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequestDTO(
        @NotBlank String token,
        @NotBlank(message = "Senha é obrigatório.") @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres.") String newPassword
) {
}
