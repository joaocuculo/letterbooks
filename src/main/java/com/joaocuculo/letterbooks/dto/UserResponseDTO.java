package com.joaocuculo.letterbooks.dto;

import com.joaocuculo.letterbooks.entities.enums.UserRole;
import com.joaocuculo.letterbooks.entities.enums.UserStatus;

import java.time.LocalDateTime;

public record UserResponseDTO(
        Long id,
        String username,
        String email,
        UserRole role,
        UserStatus status,
        LocalDateTime createdAt
) {
}
