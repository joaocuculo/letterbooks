package com.joaocuculo.letterbooks.dto.external;

public record GoogleBooksSearchRequestDTO(
        String title,
        String author,
        String publisher,
        String subject,
        String isbn,
        String freeText,
        String maxResults,
        String startIndex
) {
}
