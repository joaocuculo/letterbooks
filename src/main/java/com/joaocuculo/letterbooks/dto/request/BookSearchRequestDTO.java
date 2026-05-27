package com.joaocuculo.letterbooks.dto.request;

public record BookSearchRequestDTO(
        String title,
        String author,
        String publisher,
        String subject,
        String isbn,
        String freeText
        ) {
}
