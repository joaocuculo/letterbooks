package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.repositories.RatingRepository;
import org.springframework.stereotype.Service;

@Service
public class RatingsService {

    private final RatingRepository ratingRepository;

    public RatingsService(RatingRepository ratingRepository) {
        this.ratingRepository = ratingRepository;
    }


}
