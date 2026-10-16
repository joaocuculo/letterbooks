package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AccountDeletionRequestDTO(
        @NotBlank(message = "Informe sua senha atual.") String currentPassword
) {
}
