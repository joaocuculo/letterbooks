package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.NotBlank;

public record BookshelfItemRequestDTO(
        @NotBlank(message = "ID do livro no Google Books é obrigatório.")
        String googleBooksId
) {
}
