package com.joaocuculo.letterbooks.dto.response;

import java.util.List;

public record BookCardResponseDTO(
        String id,
        String title,
        List<String> authors,
        String publisher,
        String publishedDate,
        String thumbnailUrl,
        boolean isFavorite,
        Long userBookId
) {
}
