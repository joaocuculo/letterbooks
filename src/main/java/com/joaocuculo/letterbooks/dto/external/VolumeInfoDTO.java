package com.joaocuculo.letterbooks.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record VolumeInfoDTO(
        @JsonProperty("title") String title,
        @JsonProperty("subtitle") String subtitle,
        @JsonProperty("authors") List<String> authors,
        @JsonProperty("publisher") String publisher,
        @JsonProperty("publishedDate") String publishedDate,
        @JsonProperty("description") String description,
        @JsonProperty("industryIdentifiers") List<IndustryIdentifiersDTO> industryIdentifiers,
        @JsonProperty("pageCount") Integer pageCount,
        @JsonProperty("categories") List<String> categories,
        @JsonProperty("maturityRating") String maturityRating,
        @JsonProperty("imageLinks") ImageLinksDTO imageLinks,
        @JsonProperty("language") String language
) {
}
