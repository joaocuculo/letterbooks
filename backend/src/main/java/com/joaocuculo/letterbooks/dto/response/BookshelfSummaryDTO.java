package com.joaocuculo.letterbooks.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record BookshelfSummaryDTO(
        Long id,
        String name,
        String description,
        boolean isPublicShelf,
        Integer booksCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<BookSummaryDTO> previewBooks
) {
}
