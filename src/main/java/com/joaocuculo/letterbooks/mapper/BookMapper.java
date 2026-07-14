package com.joaocuculo.letterbooks.mapper;

import com.joaocuculo.letterbooks.dto.external.GoogleBooksResponseDTO;
import com.joaocuculo.letterbooks.dto.response.BookResponseDTO;
import com.joaocuculo.letterbooks.dto.response.BookSummaryDTO;
import com.joaocuculo.letterbooks.entities.Author;
import com.joaocuculo.letterbooks.entities.Book;
import com.joaocuculo.letterbooks.entities.Category;
import com.joaocuculo.letterbooks.entities.enums.MaturityRating;

import java.util.Set;

public class BookMapper {

    public static Book toEntity(GoogleBooksResponseDTO dto, Set<Author> authors, Set<Category> categories) {
        Book book = new Book(
                dto.googleBooksId(),
                dto.volumeInfo().title(),
                dto.volumeInfo().subtitle(),
                dto.volumeInfo().description(),
                dto.volumeInfo().publisher(),
                dto.volumeInfo().publishedDate(),
                extractedPublishedYear(dto.volumeInfo().publishedDate()),
                dto.getPreferredImageUrl(),
                dto.getThumbnailUrl(),
                dto.volumeInfo().pageCount(),
                dto.volumeInfo().language(),
                dto.getIsbn(),
                parseMaturityRating(dto.volumeInfo().maturityRating())
        );

        book.getAuthors().addAll(authors);
        book.getCategories().addAll(categories);

        return book;
    }

    public static BookResponseDTO toResponseDTO(GoogleBooksResponseDTO dto) {
        return new BookResponseDTO(
                dto.googleBooksId(),
                dto.volumeInfo().title(),
                dto.volumeInfo().subtitle(),
                dto.volumeInfo().authors(),
                dto.volumeInfo().publisher(),
                dto.volumeInfo().publishedDate(),
                dto.volumeInfo().categories(),
                dto.volumeInfo().description(),
                dto.volumeInfo().pageCount(),
                dto.volumeInfo().language(),
                dto.getIsbn(),
                dto.volumeInfo().maturityRating(),
                dto.getPreferredImageUrl(),
                dto.getThumbnailUrl(),
                "GOOGLE"
        );
    }

    public static BookResponseDTO toResponseDTO(Book book) {
        return new BookResponseDTO(
                book.getGoogleBooksId(),
                book.getTitle(),
                book.getSubtitle(),
                book.getAuthors().stream().map(Author::getName).toList(),
                book.getPublisher(),
                book.getPublishedDate(),
                book.getCategories().stream().map(Category::getName).toList(),
                book.getDescription(),
                book.getPageCount(),
                book.getLanguage(),
                book.getIsbn(),
                book.getMaturityRating().toString(),
                book.getImageUrl(),
                book.getThumbnailUrl(),
                "LOCAL"
        );
    }

    public static BookSummaryDTO toSummaryDTO(Book book) {
        return new BookSummaryDTO(
                book.getId(),
                book.getTitle(),
                book.getThumbnailUrl()
        );
    }

    private static Integer extractedPublishedYear(String publishedDate) {
        if (publishedDate == null || publishedDate.length() < 4) {
            return null;
        }
        try {
            return Integer.parseInt(publishedDate.substring(0, 4));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static MaturityRating parseMaturityRating(String maturityRating) {
        if (maturityRating == null || maturityRating.isBlank()) {
            return MaturityRating.NOT_MATURE;
        }
        try {
            return MaturityRating.valueOf(maturityRating.toUpperCase());
        } catch (IllegalArgumentException e) {
            return MaturityRating.NOT_MATURE;
        }
    }
}
