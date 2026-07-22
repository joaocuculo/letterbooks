package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BookshelfRequestDTO(
        @NotBlank(message = "Nome da estante é obrigatório.")
        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres.")
        String name,
        @Size(max = 1000, message = "Descrição deve ter no máximo 1000 caracteres.")
        String description,
        @NotNull(message = "É obrigatório informar se a estante é pública.")
        Boolean isPublicShelf
) {
}
