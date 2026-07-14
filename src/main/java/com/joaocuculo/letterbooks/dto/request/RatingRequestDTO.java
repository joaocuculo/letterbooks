package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RatingRequestDTO(
        @NotNull(message = "Pontuação é obrigatório.")
        @Min(value = 0, message = "A pontuação não pode ser menor que 0.")
        @Max(value = 5, message = "A pontuação não pode ser maior que 5.")
        Integer score,
        String comment,
        @NotBlank(message = "ID do livro no Google Books é obrigatório.")
        String googleBooksId
) {
}
