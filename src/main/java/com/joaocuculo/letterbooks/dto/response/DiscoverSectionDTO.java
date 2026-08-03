package com.joaocuculo.letterbooks.dto.response;

import java.util.List;

public record DiscoverSectionDTO(
        String key,
        String title,
        List<BookCardResponseDTO> books
) {
}
