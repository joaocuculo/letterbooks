package com.joaocuculo.letterbooks.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ImageLinksDTO(
        @JsonProperty("extraLarge") String imageUrl,
        @JsonProperty("thumbnail") String thumbnailUrl
) {
}
