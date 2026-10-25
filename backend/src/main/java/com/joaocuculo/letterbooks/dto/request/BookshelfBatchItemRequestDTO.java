package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;

public record BookshelfBatchItemRequestDTO(
        @NotBlank(message = "ID do livro no Google Books é obrigatório.") String googleBooksId,
        @NotEmpty(message = "Selecione ao menos uma estante.") List<@NotNull @Positive Long> bookshelfIds
) {}
