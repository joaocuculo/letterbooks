package com.joaocuculo.letterbooks.dto.response;

import java.util.List;

public record DiscoverResponseDTO(
        List<DiscoverSectionDTO> sections
) {
}
