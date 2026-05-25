package com.joaocuculo.letterbooks.mapper;

import com.joaocuculo.letterbooks.dto.external.GoogleBooksResponseDTO;
import com.joaocuculo.letterbooks.dto.response.BookSearchResponseDTO;
import com.joaocuculo.letterbooks.entities.Author;
import com.joaocuculo.letterbooks.entities.Book;
import com.joaocuculo.letterbooks.entities.Category;

public class BookMapper {

    public static BookSearchResponseDTO fromGoogle(GoogleBooksResponseDTO dto) {
        return new BookSearchResponseDTO(
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

    public static BookSearchResponseDTO fromEntity(Book entity) {
        return new BookSearchResponseDTO(
                entity.getGoogleBooksId(),
                entity.getTitle(),
                entity.getSubtitle(),
                entity.getAuthors().stream().map(Author::getName).toList(),
                entity.getPublisher(),
                entity.getPublishedDate(),
                entity.getCategories().stream().map(Category::getName).toList(),
                entity.getDescription(),
                entity.getPageCount(),
                entity.getLanguage(),
                entity.getIsbn(),
                entity.getMaturityRating().toString(),
                entity.getImageUrl(),
                entity.getThumbnailUrl(),
                "LOCAL"
        );
    }
}
