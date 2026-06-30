package com.joaocuculo.letterbooks.mapper;

import com.joaocuculo.letterbooks.dto.response.RatingResponseDTO;
import com.joaocuculo.letterbooks.entities.Rating;

public class RatingMapper {

    public static RatingResponseDTO fromEntity(Rating rating) {
        return new RatingResponseDTO(
                rating.getId(),
                rating.getScore(),
                rating.getComment(),
                rating.getCreatedAt(),
                rating.getUpdatedAt(),
                rating.getUser(),
                rating.getBook()
        );
    }
}
