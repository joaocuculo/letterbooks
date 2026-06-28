package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.dto.response.RatingResponseDTO;
import com.joaocuculo.letterbooks.entities.Rating;
import com.joaocuculo.letterbooks.repositories.RatingRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;

    public RatingService(RatingRepository ratingRepository) {
        this.ratingRepository = ratingRepository;
    }

    public Page<RatingResponseDTO> findByUserId(Long userId, Pageable pageable) {
        Page<Rating> ratings = ratingRepository.findByUserId(userId);
        return ratings.map(
                rating -> new RatingResponseDTO(
                        rating.getId(),
                        rating.getScore(),
                        rating.getComment(),
                        rating.getCreatedAt(),
                        rating.getUpdatedAt(),
                        rating.getUser(),
                        rating.getBook()
                )
        );
    }

    public Page<RatingResponseDTO> findByBookId(Long bookId, Pageable pageable) {
        Page<Rating> ratings = ratingRepository.findByBookId(bookId);
        return ratings.map(
                rating -> new RatingResponseDTO(
                        rating.getId(),
                        rating.getScore(),
                        rating.getComment(),
                        rating.getCreatedAt(),
                        rating.getUpdatedAt(),
                        rating.getUser(),
                        rating.getBook()
                )
        );
    }
}
