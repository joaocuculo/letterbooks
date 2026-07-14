package com.joaocuculo.letterbooks.dto.response;

public record BookSummaryDTO(
        Long id,
        String title,
        String thumbnailUrl
) {
}
