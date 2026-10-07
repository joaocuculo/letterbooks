package com.joaocuculo.letterbooks.client;

import com.joaocuculo.letterbooks.dto.external.GoogleBooksResponseDTO;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksSearchResponseDTO;
import com.joaocuculo.letterbooks.exceptions.ExternalServiceException;
import com.joaocuculo.letterbooks.exceptions.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.Exceptions;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.concurrent.TimeoutException;

@Component
public class GoogleBooksClient {

    private static final Logger log = LoggerFactory.getLogger(GoogleBooksClient.class);
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
                .retryWhen(
                        Retry.backoff(2, Duration.ofMillis(500))
                                .filter(ex -> ex instanceof WebClientRequestException)
                )
                // Limita o tempo total da busca, incluindo as tentativas de conexão.
                .timeout(Duration.ofSeconds(5))
                .onErrorResume(ex -> {
                    logSearchError(ex);
                    return Mono.empty();
                })
                .block();
    }

    private void logSearchError(Throwable exception) {
        Throwable cause = Exceptions.isRetryExhausted(exception) ? exception.getCause() : exception;

        if (cause instanceof WebClientResponseException responseException) {
            String responseBody = responseException.getResponseBodyAsString();
            if (apiKey != null && !apiKey.isBlank()) {
                responseBody = responseBody.replace(apiKey, "[CHAVE OMITIDA]");
            }
            responseBody = responseBody.replaceAll("[\\r\\n]+", " ");
            log.warn("Erro ao pesquisar no Google Books. HTTP {}. Resposta: {}",
                    responseException.getStatusCode().value(),
                    responseBody.substring(0, Math.min(responseBody.length(), 1000)));
        } else if (cause instanceof TimeoutException) {
            log.warn("Tempo de resposta da busca no Google Books excedeu 5 segundos.");
        } else if (cause instanceof WebClientRequestException) {
            log.warn("Não foi possível conectar ao Google Books durante a busca.");
        } else {
            // Não registra a exceção completa, pois ela pode conter a URL com a chave da API.
            log.warn("Erro ao processar a busca no Google Books. Tipo: {}", cause.getClass().getSimpleName());
        }
    }

    public GoogleBooksResponseDTO findByGoogleBooksId(String googleBooksId) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/volumes/{id}")
                        .queryParam("key", apiKey)
                        .build(googleBooksId))
                .retrieve()
                // trata 404
                .onStatus(
                        status -> status.value() == 404,
                        response -> Mono.error(
                                new ResourceNotFoundException("Livro não encontrado no Google Books.")
                        )
                )
                // trata outros erros (400, 401, 403, 429, 500, 503...)
                .onStatus(
                        status -> status.isError(),
                        response -> response.createException()
                                .flatMap(ex -> Mono.error(
                                        new ExternalServiceException("Erro ao consultar o Google Books.")
                                ))
                )
                .bodyToMono(GoogleBooksResponseDTO.class)
                .timeout(Duration.ofSeconds(10))
                // tenta novamente se houver ero de conexão
                .retryWhen(
                        Retry.backoff(2, Duration.ofMillis(500))
                                .filter(ex -> ex instanceof WebClientRequestException)
                )
                // trata timeout
                .onErrorMap(
                        TimeoutException.class,
                        ex -> new ExternalServiceException("Tempo de resposta do Google Books foi excedido.")
                )
                // trata erro de conexão
                .onErrorMap(
                        WebClientRequestException.class,
                        ex -> new ExternalServiceException("Não foi possível conectar ao Google Books")
                )
                .block();
    }
}
