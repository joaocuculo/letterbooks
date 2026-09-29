package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AuthorNameRequestDTO(
        @NotBlank(message = "Nome é obrigatório.")
        String name
) {
}
