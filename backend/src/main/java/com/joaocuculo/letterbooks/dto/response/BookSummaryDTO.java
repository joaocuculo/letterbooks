package com.joaocuculo.letterbooks.dto.response;

public record BookSummaryDTO(
        Long id,
        String googleBooksId,
        String title,
        String thumbnailUrl
) {
}
