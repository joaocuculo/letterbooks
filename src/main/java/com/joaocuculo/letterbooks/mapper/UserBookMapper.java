package com.joaocuculo.letterbooks.mapper;

import com.joaocuculo.letterbooks.dto.response.UserBookResponseDTO;
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
}
