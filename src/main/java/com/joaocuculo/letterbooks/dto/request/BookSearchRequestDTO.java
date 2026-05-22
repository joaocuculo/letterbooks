package com.joaocuculo.letterbooks.dto.request;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record BookSearchRequestDTO(
        String title,
        String author,
        String publisher,
        String subject,
        String isbn,
        String freeText
        ) {
}
