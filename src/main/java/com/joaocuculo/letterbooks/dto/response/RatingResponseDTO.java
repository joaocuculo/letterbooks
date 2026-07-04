package com.joaocuculo.letterbooks.dto.response;

import java.time.LocalDateTime;

public record RatingResponseDTO(
        Long id,
        Integer score,
        String comment,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        UserSummaryDTO user,
        BookSummaryDTO book
) {
}
