package com.joaocuculo.letterbooks.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@EnableSpringDataWebSupport(
        pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO
)
public class AppConfig {

    @Bean
    public WebClient webClient() {
        return WebClient.builder().baseUrl("https://www.googleapis.com/books/v1").build();
    }
}
