package com.joaocuculo.letterbooks.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GoogleBooksSearchResponseDTO(
        @JsonProperty("totalItems") Integer totalItems,
        @JsonProperty("items") List<GoogleBooksResponseDTO> items
) {
}
