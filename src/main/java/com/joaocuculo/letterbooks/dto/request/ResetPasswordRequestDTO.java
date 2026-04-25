package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ResetPasswordRequestDTO(
        @NotBlank String token,
        @NotBlank(message = "Senha é obrigatório.") String newPassword
) {
}
