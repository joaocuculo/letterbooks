package com.joaocuculo.letterbooks.dto.response;

import java.util.List;

public record BookResponseDTO(
        String id,
        String title,
        String subtitle,
        List<String> authors,
        String publisher,
        String publishedDate,
        List<String> categories,
        String description,
        Integer pageCount,
        String language,
        String isbn,
        String maturityRating,
        String imageUrl,
        String thumbnailUrl,
        String source
) {
}
