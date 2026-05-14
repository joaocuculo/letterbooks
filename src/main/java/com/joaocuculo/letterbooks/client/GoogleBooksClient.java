package com.joaocuculo.letterbooks.client;

import com.joaocuculo.letterbooks.dto.external.GoogleBooksResponseDTO;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksSearchResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class GoogleBooksClient {

    private final WebClient webClient;

    @Value("${googlebooks.api.key}")
    private String apiKey;

    public GoogleBooksClient(WebClient webClient) {
        this.webClient = webClient;
    }

    public GoogleBooksSearchResponseDTO search(String q, Integer maxResults, Integer startIndex) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/volumes")
                        .queryParam("q", q)
                        .queryParam("maxResults", maxResults != null ? maxResults : 10)
                        .queryParam("startIndex", startIndex != null ? startIndex : 0)
                        .queryParam("key", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(GoogleBooksSearchResponseDTO.class)
                .block();
    }

    public GoogleBooksResponseDTO findByGoogleBooksId(String googleBooksId) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/volumes/{id}")
                        .queryParam("key", apiKey)
                        .build(googleBooksId))
                .retrieve()
                .bodyToMono(GoogleBooksResponseDTO.class)
                .block();
    }
}
