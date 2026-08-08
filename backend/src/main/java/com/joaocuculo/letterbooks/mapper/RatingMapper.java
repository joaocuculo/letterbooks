package com.joaocuculo.letterbooks.mapper;

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
                UserMapper.toSummaryDTO(rating.getUser()),
                BookMapper.toSummaryDTO(rating.getBook())
        );
    }

    public static void updateEntity(Rating rating, RatingUpdateDTO dto) {
        if (dto.score() != null) {
            rating.setScore(dto.score());
        }
        if (dto.comment() != null) {
            rating.setComment(dto.comment());
        }
    }
}
