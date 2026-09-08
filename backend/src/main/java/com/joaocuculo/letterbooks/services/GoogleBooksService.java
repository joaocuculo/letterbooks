package com.joaocuculo.letterbooks.services;

import com.joaocuculo.letterbooks.client.GoogleBooksClient;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksResponseDTO;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksSearchResponseDTO;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class GoogleBooksService {

    private GoogleBooksClient googleBooksClient;

    public GoogleBooksService(GoogleBooksClient googleBooksClient) {
        this.googleBooksClient = googleBooksClient;
    }

    @Cacheable(
            cacheNames = "googleBooksSearch",
            unless = "#result == null"
    )
    public GoogleBooksSearchResponseDTO search(String query, Integer maxResults, Integer startIndex) {
        return googleBooksClient.search(query, maxResults, startIndex);
    }

    @Cacheable(
            cacheNames = "googleBooksVolume",
            key = "#googleBooksId",
            sync = true
    )
    public GoogleBooksResponseDTO findByGoogleBooksId(String googleBooksId) {
        return googleBooksClient.findByGoogleBooksId(googleBooksId);
    }
}
