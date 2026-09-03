package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.Rating;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Page<Rating> findByUserId(Long userId, Pageable pageable);
    Page<Rating> findByBookGoogleBooksId(String googleBooksId, Pageable pageable);
    Optional<Rating> findByUserIdAndBookGoogleBooksId(Long userId, String googleBooksId);
    boolean existsByUserIdAndBookId(Long userId, Long bookId);
}
