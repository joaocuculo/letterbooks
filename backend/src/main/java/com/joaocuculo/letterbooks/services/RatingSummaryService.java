package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.repositories.RatingRepository;
import com.joaocuculo.letterbooks.repositories.projections.BookRatingAverage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RatingSummaryService {
    private final RatingRepository ratingRepository;

    public RatingSummaryService(RatingRepository ratingRepository) {
        this.ratingRepository = ratingRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Double> averagesFor(Collection<String> googleBooksIds) {
        if (googleBooksIds.isEmpty()) return Map.of();
        // No entity loading or persistence: missing books and unrated books have no group.
        return ratingRepository.findAveragesByGoogleBooksIds(googleBooksIds.stream().distinct().toList())
                .stream().collect(Collectors.toMap(BookRatingAverage::getGoogleBooksId, BookRatingAverage::getAverageRating));
    }
}
