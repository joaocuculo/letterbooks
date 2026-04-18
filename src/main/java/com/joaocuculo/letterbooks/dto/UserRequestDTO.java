package com.joaocuculo.letterbooks.dto;

public record UserRequestDTO(
        String username,
        String email,
        String password
) {
}
