package com.joaocuculo.letterbooks.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Optional;

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
            @JsonProperty("smallThumbnail") String smallThumbnail,
            @JsonProperty("thumbnail") String thumbnail,
            @JsonProperty("small") String small,
            @JsonProperty("medium") String medium,
            @JsonProperty("large") String large,
            @JsonProperty("extraLarge") String extraLarge
    ) {
    }

    @JsonIgnore
    public String getIsbn() {
        if (volumeInfo == null || volumeInfo.industryIdentifiers == null) {
            return null;
        }

        Optional<String> isbn13 = volumeInfo.industryIdentifiers.stream()
                .filter(isbn -> "ISBN_13".equals(isbn.type))
                .map(IndustryIdentifiers::identifier)
                .findFirst();

        return isbn13.orElseGet(() -> volumeInfo.industryIdentifiers.stream()
                .filter(isbn -> "ISBN_10".equals(isbn.type))
                .map(IndustryIdentifiers::identifier)
                .findFirst()
                .orElse(null));
    }

    @JsonIgnore
    public String getThumbnailUrl() {
        if (volumeInfo == null || volumeInfo.imageLinks == null) {
            return null;
        }
        if (volumeInfo.imageLinks.thumbnail != null) return volumeInfo.imageLinks.thumbnail;
        return volumeInfo.imageLinks.smallThumbnail;
    }

    @JsonIgnore
    public String getPreferredImageUrl() {
        if (volumeInfo == null || volumeInfo.imageLinks == null) {
            return null;
        }
        ImageLinks images = volumeInfo.imageLinks;
        if (images.extraLarge != null) return images.extraLarge;
        if (images.large != null) return images.large;
        if (images.medium != null) return images.medium;
        if (images.small != null) return images.small;
        return images.thumbnail;
    }
}
