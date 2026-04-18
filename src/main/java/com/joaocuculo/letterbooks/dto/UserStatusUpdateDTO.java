package com.joaocuculo.letterbooks.dto;

import com.joaocuculo.letterbooks.entities.enums.UserRole;
import com.joaocuculo.letterbooks.entities.enums.UserStatus;
import jakarta.validation.constraints.NotNull;

public record UserStatusUpdateDTO(
        @NotNull UserRole role,
        @NotNull UserStatus status
) {
}
