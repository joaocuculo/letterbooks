package com.joaocuculo.letterbooks.mapper;

import com.joaocuculo.letterbooks.dto.request.UserBookRequestDTO;
import com.joaocuculo.letterbooks.dto.request.UserBookUpdateDTO;
import com.joaocuculo.letterbooks.dto.response.UserBookResponseDTO;
import com.joaocuculo.letterbooks.entities.Book;
import com.joaocuculo.letterbooks.entities.User;
import com.joaocuculo.letterbooks.entities.UserBook;

public class UserBookMapper {

    public static UserBookResponseDTO toResponseDTO(UserBook userBook) {
        return new UserBookResponseDTO(
                userBook.getId(),
                userBook.getStatus(),
                userBook.isFavorite(),
                userBook.getCurrentPage(),
                UserMapper.toSummaryDTO(userBook.getUser()),
                BookMapper.toSummaryDTO(userBook.getBook()),
                userBook.getStartedAt(),
                userBook.getFinishedAt(),
                userBook.getCreatedAt(),
                userBook.getUpdatedAt()
        );
    }

    public static UserBook toEntity(UserBookRequestDTO dto, User user, Book book) {
        return new UserBook(
                dto.status(),
                dto.isFavorite(),
                dto.currentPage(),
                dto.startedAt(),
                dto.finishedAt(),
                user,
                book
        );
    }

    public static void updateEntity(UserBook userBook, UserBookUpdateDTO dto) {
        if (dto.status() != null) {
            userBook.setStatus(dto.status());
        }
        if (dto.isFavorite() != null) {
            userBook.setFavorite(dto.isFavorite());
        }
        if (dto.currentPage() != null) {
            userBook.setCurrentPage(dto.currentPage());
        }
        if (dto.startedAt() != null) {
            userBook.setStartedAt(dto.startedAt());
        }
        if (dto.finishedAt() != null) {
            userBook.setFinishedAt(dto.finishedAt());
        }
    }
}
