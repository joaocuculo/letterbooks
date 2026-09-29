package com.joaocuculo.letterbooks.dto.response;

public record AuthorNameResponseDTO(
        Long id,
        String name,
        boolean primary
) {
}
