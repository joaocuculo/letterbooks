package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RatingRequestDTO(
        @NotBlank(message = "Pontuação é obrigatório.") Integer score,
        String comment,
        @NotNull Long userId,
        @NotNull String googleBooksId
) {
}
