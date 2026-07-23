package com.joaocuculo.letterbooks.dto.request;

import com.joaocuculo.letterbooks.entities.enums.UserRole;
import com.joaocuculo.letterbooks.entities.enums.UserStatus;
import jakarta.validation.constraints.NotNull;

public record UserStatusUpdateDTO(
        @NotNull(message = "Cargo do usuário é obrigatório.")
        UserRole role,
        @NotNull(message = "Status do usuário é obrigatório.")
        UserStatus status
) {
}
