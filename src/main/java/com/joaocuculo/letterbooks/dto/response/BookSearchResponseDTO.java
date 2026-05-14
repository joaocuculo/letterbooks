package com.joaocuculo.letterbooks.dto.response;

import java.util.List;

public record BookSearchResponseDTO(
        String id,
        String title,
        String subtitle,
        List<String> authors,
        String publisher,
        String publishedDate,
        String isbn,
        String imageUrl,
        String thumbnailUrl,
        String source
) {
}
