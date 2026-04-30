package com.joaocuculo.letterbooks.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GoogleBooksResponseDTO(
        @JsonProperty("id") String googleBooksId,
        @JsonProperty("volumeInfo") VolumeInfoDTO volumeInfo
) {
}
