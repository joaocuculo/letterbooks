package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.NotBlank;

public record RatingUpdateDTO(
        @NotBlank(message = "Pontuação é obrigatório.") Integer score,
        String comment
) {
}
