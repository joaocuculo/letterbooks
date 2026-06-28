package com.joaocuculo.letterbooks.dto.response;

import com.joaocuculo.letterbooks.entities.Book;
import com.joaocuculo.letterbooks.entities.User;

import java.time.LocalDateTime;

public record RatingResponseDTO(
        Long id,
        Integer score,
        String comment,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        User user,
        Book book
) {
}
