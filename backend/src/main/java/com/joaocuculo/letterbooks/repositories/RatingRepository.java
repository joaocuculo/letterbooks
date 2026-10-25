package com.joaocuculo.letterbooks.repositories;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import com.joaocuculo.letterbooks.entities.Rating;

import java.util.Optional;
import java.util.Collection;
import java.util.List;
import com.joaocuculo.letterbooks.repositories.projections.BookRatingAverage;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    @Query("""
        SELECT r.book.googleBooksId AS googleBooksId, AVG(r.score) AS averageRating
        FROM Rating r
        WHERE r.book.googleBooksId IN :googleBooksIds
        GROUP BY r.book.googleBooksId
        """)
    List<BookRatingAverage> findAveragesByGoogleBooksIds(@Param("googleBooksIds") Collection<String> googleBooksIds);

    @Modifying
    @Query("delete from Rating r where r.user.id = :userId")
    int deleteAllByUserId(@Param("userId") Long userId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"book", "user"})
    @Query(value = "SELECT r FROM Rating r WHERE r.user.id = :userId AND LOWER(r.book.title) LIKE LOWER(:pattern) ESCAPE '!'",
           countQuery = "SELECT COUNT(r) FROM Rating r WHERE r.user.id = :userId AND LOWER(r.book.title) LIKE LOWER(:pattern) ESCAPE '!'")
    Page<Rating> searchByUserId(@Param("userId") Long userId, @Param("pattern") String pattern, Pageable pageable);

    Page<Rating> findByUserId(Long userId, Pageable pageable);
    Page<Rating> findByBookGoogleBooksId(String googleBooksId, Pageable pageable);
    Optional<Rating> findByUserIdAndBookGoogleBooksId(Long userId, String googleBooksId);
    boolean existsByUserIdAndBookId(Long userId, Long bookId);
}
