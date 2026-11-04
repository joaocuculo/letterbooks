package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.*;
import java.util.List;

public record BookshelfBulkRequestDTO(
        @NotEmpty(message = "Selecione ao menos um livro.")
        @Size(max = 20, message = "Selecione até 20 livros por operação.")
        List<@NotBlank(message = "O identificador do livro é obrigatório.") String> googleBooksIds,
        @NotEmpty(message = "Selecione ao menos uma estante.")
        @Size(max = 20, message = "Selecione até 20 estantes por operação.")
        List<@NotNull(message = "O identificador da estante é obrigatório.")
             @Positive(message = "O identificador da estante deve ser positivo.") Long> bookshelfIds
) {}
