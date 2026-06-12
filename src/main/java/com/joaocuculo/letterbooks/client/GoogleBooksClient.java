package com.joaocuculo.letterbooks.client;

import com.joaocuculo.letterbooks.dto.external.GoogleBooksResponseDTO;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksSearchResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;

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
                        .queryParam("printType", "books")
                        .queryParam("key", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(GoogleBooksSearchResponseDTO.class)
                .timeout(Duration.ofSeconds(2))
                .retryWhen(
                        Retry.backoff(2, Duration.ofMillis(500))
                                .filter(ex -> ex instanceof WebClientRequestException)
                )
                .onErrorResume(ex -> Mono.empty())
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
                .timeout(Duration.ofSeconds(2))
                .retryWhen(
                        Retry.backoff(2, Duration.ofMillis(500))
                                .filter(ex -> ex instanceof WebClientRequestException)
                )
                .onErrorResume(ex -> Mono.empty())
                .block();
    }
}
