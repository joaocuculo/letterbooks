package com.joaocuculo.letterbooks.dto.response;

import com.joaocuculo.letterbooks.entities.enums.UserBookStatus;

import java.time.LocalDateTime;

public record UserBookResponseDTO(
        Long id,
        UserBookStatus status,
        boolean isFavorite,
        Integer currentPage,
        UserSummaryDTO user,
        BookSummaryDTO book,
        LocalDateTime startedAt,
        LocalDateTime finishedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
