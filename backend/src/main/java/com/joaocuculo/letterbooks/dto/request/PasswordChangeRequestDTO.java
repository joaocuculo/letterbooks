package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordChangeRequestDTO(
        @NotBlank(message = "Senha atual é obrigatória.")
        String currentPassword,
        @NotBlank(message = "Nova senha é obrigatória.")
        @Size(min = 6, message = "A nova senha deve ter no mínimo 6 caracteres.")
        String newPassword
) {
}
