package com.joaocuculo.letterbooks.mapper;

import com.joaocuculo.letterbooks.dto.response.UserResponseDTO;
import com.joaocuculo.letterbooks.dto.response.UserSummaryDTO;
import com.joaocuculo.letterbooks.entities.User;

public class UserMapper {

    public static UserResponseDTO toResponseDTO(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt()
        );
    }

    public static UserSummaryDTO toSummaryDTO(User user) {
        return new UserSummaryDTO(
                user.getId(),
                user.getName()
        );
    }
}
