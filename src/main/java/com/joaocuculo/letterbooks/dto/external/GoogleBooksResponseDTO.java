package com.joaocuculo.letterbooks.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GoogleBooksResponseDTO(
        @JsonProperty("id") String googleBooksId,
        @JsonProperty("volumeInfo") VolumeInfo volumeInfo
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record VolumeInfo(
            @JsonProperty("title") String title,
            @JsonProperty("subtitle") String subtitle,
            @JsonProperty("authors") List<String> authors,
            @JsonProperty("publisher") String publisher,
            @JsonProperty("publishedDate") String publishedDate,
            @JsonProperty("description") String description,
            @JsonProperty("industryIdentifiers") List<IndustryIdentifiers> industryIdentifiers,
            @JsonProperty("pageCount") Integer pageCount,
            @JsonProperty("categories") List<String> categories,
            @JsonProperty("maturityRating") String maturityRating,
            @JsonProperty("imageLinks") ImageLinks imageLinks,
            @JsonProperty("language") String language
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record IndustryIdentifiers(
            @JsonProperty("type") String type,
            @JsonProperty("identifier") String identifier
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ImageLinks(
            @JsonProperty("extraLarge") String imageUrl,
            @JsonProperty("thumbnail") String thumbnailUrl
    ) {
    }
}
