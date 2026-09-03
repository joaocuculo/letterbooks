package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.UserBook;
import com.joaocuculo.letterbooks.entities.enums.UserBookStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserBookRepository extends JpaRepository<UserBook, Long> {
    Page<UserBook> findByUserId(Long userId, Pageable pageable);
    Page<UserBook> findByUserIdAndStatus(Long userId, UserBookStatus status, Pageable pageable);
    Optional<UserBook> findByUserIdAndBookGoogleBooksId(Long userId, String googleBooksId);
    boolean existsByUserIdAndBookId(Long userId, Long bookId);

    @Query("""
        SELECT ub FROM UserBook ub
        JOIN FETCH ub.book b
        WHERE ub.user.id = :userId AND b.googleBooksId IN :googleBooksId
    """)
    List<UserBook> findByUserIdAndBookGoogleBooksIdIn(
            @Param("userId") Long userId,
            @Param("googleBooksId") Collection<String> googleBooksIds);
}
