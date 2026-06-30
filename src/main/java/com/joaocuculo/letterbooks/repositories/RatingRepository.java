package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.Rating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Page<Rating> findByUserId(Long userId, Pageable pageable);
    Page<Rating> findByBookId(Long bookId, Pageable pageable);
    Optional<Rating> findByUserIdAndBookId(Long userId, Long bookId);
}
