package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.Rating;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Page<Rating> findByUserId(Long userId);
    Page<Rating> findByBookId(Long bookId);
}
