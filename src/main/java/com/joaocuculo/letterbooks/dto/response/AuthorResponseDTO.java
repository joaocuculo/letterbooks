package com.joaocuculo.letterbooks.dto.response;

public record AuthorResponseDTO(
        Long id,
        String name,
        String normalizedName
) {
}
