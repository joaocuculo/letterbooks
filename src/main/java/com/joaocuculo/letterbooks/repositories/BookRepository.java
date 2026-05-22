package com.joaocuculo.letterbooks.repositories;

import com.joaocuculo.letterbooks.entities.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    @Query("""
                SELECT DISTINCT b
                FROM Book b
                LEFT JOIN b.authors a
                LEFT JOIN b.categories c
                WHERE
                    (:title IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%')))
                AND (:author IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :author, '%')))
                AND (:publisher IS NULL OR LOWER(b.publisher) LIKE LOWER(CONCAT('%', :publisher, '%')))
                AND (:subject IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :subject, '%')))
                AND (:isbn IS NULL OR b.isbn = :isbn)
                AND (
                        :freeText IS NULL
                        OR LOWER(b.title) LIKE LOWER(CONCAT('%', :freeText, '%'))
                        OR LOWER(b.subtitle) LIKE LOWER(CONCAT('%', :freeText, '%'))
                        OR LOWER(b.description) LIKE LOWER(CONCAT('%', :freeText, '%'))
                        OR LOWER(a.name) LIKE LOWER(CONCAT('%', :freeText, '%'))
                    )
            """)
    Page<Book> search(
            String title,
            String author,
            String publisher,
            String subject,
            String isbn,
            String freeText,
            Pageable pageable);
}
