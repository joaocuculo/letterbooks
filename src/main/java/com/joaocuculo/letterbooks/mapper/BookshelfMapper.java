package com.joaocuculo.letterbooks.mapper;

import com.joaocuculo.letterbooks.dto.request.BookshelfRequestDTO;
import com.joaocuculo.letterbooks.dto.response.BookshelfResponseDTO;
import com.joaocuculo.letterbooks.dto.response.BookshelfSummaryDTO;
import com.joaocuculo.letterbooks.entities.Bookshelf;
import com.joaocuculo.letterbooks.entities.BookshelfItem;
import com.joaocuculo.letterbooks.entities.User;

public class BookshelfMapper {

    public static BookshelfSummaryDTO toSummaryDTO(Bookshelf bookshelf) {
        return new BookshelfSummaryDTO(
                bookshelf.getId(),
                bookshelf.getName(),
                bookshelf.getDescription(),
                bookshelf.isPublicShelf(),
                bookshelf.getItems().size(), // pode vir ser um gargalo em caso de muitas requisições
                bookshelf.getCreatedAt(),
                bookshelf.getUpdatedAt()
        );
    }

    public static BookshelfResponseDTO toResponseDTO(Bookshelf bookshelf) {
        return new BookshelfResponseDTO(
                bookshelf.getId(),
                bookshelf.getName(),
                bookshelf.getDescription(),
                bookshelf.isPublicShelf(),
                UserMapper.toSummaryDTO(bookshelf.getUser()),
                bookshelf.getItems().stream()
                        .map(BookshelfItem::getBook)
                        .map(BookMapper::toSummaryDTO)
                        .toList(),
                bookshelf.getCreatedAt(),
                bookshelf.getUpdatedAt()
        );
    }

    public static Bookshelf toEntity(BookshelfRequestDTO dto, User user) {
        return new Bookshelf(
                dto.name(),
                dto.description(),
                dto.isPublicShelf(),
                user
        );
    }
}
