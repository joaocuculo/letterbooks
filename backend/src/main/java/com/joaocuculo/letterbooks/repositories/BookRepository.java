package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long>, JpaSpecificationExecutor<Book> {
    Optional<Book> findByGoogleBooksId(String googleBooksId);

    @Modifying
    @Query(value = """
        DELETE FROM book_author
        WHERE author_id = :sourceAuthorId
          AND EXISTS (
              SELECT 1
              FROM book_author ba_target
              WHERE ba_target.book_id = book_author.book_id
                AND ba_target.author_id = :targetAuthorId
            )
        """, nativeQuery = true)
    void removeAuthorRelationConflicts(
        @Param("targetAuthorId") Long targetAuthorId, 
        @Param("sourceAuthorId") Long sourceAuthorId
    );

    @Modifying
    @Query(value = """
        UPDATE book_author
        SET author_id = :targetAuthorId
        WHERE author_id = :sourceAuthorId
        """, nativeQuery = true)
    void transferAuthorRelations(
        @Param("targetAuthorId") Long targetAuthorId, 
        @Param("sourceAuthorId") Long sourceAuthorId
    );
}
