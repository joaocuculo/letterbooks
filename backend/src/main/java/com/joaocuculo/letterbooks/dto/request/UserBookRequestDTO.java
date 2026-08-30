package com.joaocuculo.letterbooks.dto.request;

import com.joaocuculo.letterbooks.entities.enums.UserBookStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record UserBookRequestDTO(
        @NotBlank(message = "ID do livro no Google Books é obrigatório.")
        String googleBooksId,
        UserBookStatus status,
        @NotNull(message = "É obrigatório informar se o livro é favorito.")
        boolean isFavorite,
        Integer currentPage,
        LocalDateTime startedAt,
        LocalDateTime finishedAt
) {
}
