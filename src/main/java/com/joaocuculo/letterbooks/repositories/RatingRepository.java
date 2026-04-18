package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
}
