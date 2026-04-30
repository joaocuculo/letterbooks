package com.joaocuculo.letterbooks.client;

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


}
