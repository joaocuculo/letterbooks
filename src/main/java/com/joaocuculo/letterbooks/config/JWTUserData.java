package com.joaocuculo.letterbooks.config;

import com.joaocuculo.letterbooks.entities.enums.UserRole;

public record JWTUserData(
        Long userId,
        String email,
        UserRole role
) {
}
