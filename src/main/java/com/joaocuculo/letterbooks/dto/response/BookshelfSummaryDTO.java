package com.joaocuculo.letterbooks.dto.response;

import java.time.LocalDateTime;

public record BookshelfSummaryDTO(
        Long id,
        String name,
        String description,
        Boolean isPublicShelf,
        Integer booksCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
