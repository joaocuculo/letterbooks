package com.joaocuculo.letterbooks.specifications;

import com.joaocuculo.letterbooks.dto.request.BookSearchRequestDTO;
import com.joaocuculo.letterbooks.entities.Book;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public class BookSpecifications {

    public static Specification<Book> withFilters(BookSearchRequestDTO filter) {
        return Specification
                .where(distinct())
                .and(titleContains(filter.title()))
                .and(authorContains(filter.author()))
                .and(publisherContains(filter.publisher()))
                .and(subjectContains(filter.subject()))
                .and(isbnEquals(filter.isbn()))
                .and(freeTextContains(filter.freeText()));
    }

    private static Specification<Book> distinct() {
        return (root, query, cb) -> {
            query.distinct(true);
            return null;
        };
    }

    private static Specification<Book> titleContains(String title) {
        return (root, query, cb) -> {
            if (title == null || title.isBlank()) {
                return null;
            }
            return cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
        };
    }

    private static Specification<Book> authorContains(String author) {
        return (root, query, cb) -> {
            if (author == null || author.isBlank()) {
                return null;
            }
            return cb.like(cb.lower(root.join("authors", JoinType.LEFT).get("name")), "%" + author.toLowerCase() + "%");
        };
    }

    private static Specification<Book> publisherContains(String publisher) {
        return (root, query, cb) -> {
            if (publisher == null || publisher.isBlank()) {
                return null;
            }
            return cb.like(cb.lower(root.get("publisher")), "%" + publisher.toLowerCase() + "%");
        };
    }

    private static Specification<Book> subjectContains(String subject) {
        return (root, query, cb) -> {
            if (subject == null || subject.isBlank()) {
                return null;
            }
            return cb.like(cb.lower(root.join("categories", JoinType.LEFT).get("name")), "%" + subject.toLowerCase() + "%");
        };
    }

    private static Specification<Book> isbnEquals(String isbn) {
        return (root, query, cb) -> {
            if (isbn == null || isbn.isBlank()) {
                return null;
            }
            return cb.equal(cb.lower(root.get("isbn")), isbn.toLowerCase());
        };
    }

    private static Specification<Book> freeTextContains(String freeText) {
        return (root, query, cb) -> {
            if (freeText == null || freeText.isBlank()) {
                return null;
            }

            String pattern = "%" + freeText.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("subtitle")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern),
                    cb.like(cb.lower(root.join("authors", JoinType.LEFT).get("name")), pattern)
            );
        };
    }
}
