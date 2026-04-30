package com.joaocuculo.letterbooks.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record IndustryIdentifiersDTO(
        @JsonProperty("type") String type,
        @JsonProperty("identifier") String identifier
) {
}
