package com.joaocuculo.letterbooks.mapper;

import com.joaocuculo.letterbooks.dto.response.BookshelfSummaryDTO;
import com.joaocuculo.letterbooks.entities.Bookshelf;

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
}
