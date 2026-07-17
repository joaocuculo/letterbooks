package com.joaocuculo.letterbooks.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record BookshelfResponseDTO(
        Long id,
        String name,
        String description,
        Boolean isPublicShelf,
        UserSummaryDTO user,
        List<BookSummaryDTO> book,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
