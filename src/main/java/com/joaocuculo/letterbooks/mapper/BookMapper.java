package com.joaocuculo.letterbooks.mapper;

import com.joaocuculo.letterbooks.dto.external.GoogleBooksResponseDTO;
import com.joaocuculo.letterbooks.dto.response.BookSearchResponseDTO;
import com.joaocuculo.letterbooks.entities.Author;
import com.joaocuculo.letterbooks.entities.Book;

public class BookMapper {

    public static BookSearchResponseDTO fromGoogle(GoogleBooksResponseDTO dto) {
        return new BookSearchResponseDTO(
                dto.googleBooksId(),
                dto.volumeInfo().title(),
                dto.volumeInfo().subtitle(),
                dto.volumeInfo().authors(),
                dto.volumeInfo().publisher(),
                dto.volumeInfo().publishedDate(),
                dto.getIsbn(),
                dto.getPreferredImageUrl(),
                dto.getThumbnailUrl(),
                "GOOGLE"
        );
    }

    public static BookSearchResponseDTO fromEntity(Book entity) {
        return new BookSearchResponseDTO(
                entity.getId().toString(),
                entity.getTitle(),
                entity.getSubtitle(),
                entity.getAuthors().stream().map(Author::getName).toList(),
                entity.getPublisher(),
                entity.getPublishedDate(),
                entity.getIsbn(),
                entity.getImageUrl(),
                entity.getThumbnailUrl(),
                "LOCAL"
        );
    }
}
