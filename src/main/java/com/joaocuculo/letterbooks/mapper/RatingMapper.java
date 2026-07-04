package com.joaocuculo.letterbooks.mapper;

import com.joaocuculo.letterbooks.dto.request.RatingRequestDTO;
import com.joaocuculo.letterbooks.dto.request.RatingUpdateDTO;
import com.joaocuculo.letterbooks.dto.response.RatingResponseDTO;
import com.joaocuculo.letterbooks.entities.Rating;

public class RatingMapper {

    public static RatingResponseDTO toResponseDTO(Rating rating) {
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

    public static void updateEntity(Rating rating, RatingUpdateDTO dto) {
        rating.setScore(dto.score());
        rating.setComment(dto.comment());
    }
}
