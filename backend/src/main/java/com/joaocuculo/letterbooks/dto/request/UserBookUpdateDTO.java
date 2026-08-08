package com.joaocuculo.letterbooks.dto.request;

import com.joaocuculo.letterbooks.entities.enums.UserBookStatus;

import java.time.LocalDateTime;

public record UserBookUpdateDTO(
        UserBookStatus status,
        Boolean isFavorite,
        Integer currentPage,
        LocalDateTime startedAt,
        LocalDateTime finishedAt
) {
}
