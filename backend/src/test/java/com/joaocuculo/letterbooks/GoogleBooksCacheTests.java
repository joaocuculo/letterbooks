package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.client.GoogleBooksClient;
import com.joaocuculo.letterbooks.config.CacheConfig;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksResponseDTO;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksSearchResponseDTO;
import com.joaocuculo.letterbooks.services.GoogleBooksService;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GoogleBooksCacheTests {
    @Test
    void emptyResponsesAreRetriedButSuccessfulResultsAreCached() {
        var client = mock(GoogleBooksClient.class);
        var successful = new GoogleBooksSearchResponseDTO(1, List.of(new GoogleBooksResponseDTO("id", null)));
        when(client.search("fiction", 10, 0)).thenReturn(
                new GoogleBooksSearchResponseDTO(0, null), new GoogleBooksSearchResponseDTO(0, List.of()), null, successful);
        try (var context = new AnnotationConfigApplicationContext()) {
            context.register(CacheConfig.class);
            context.registerBean(GoogleBooksClient.class, () -> client);
            context.registerBean(GoogleBooksService.class, () -> new GoogleBooksService(client));
            context.refresh();
            var service = context.getBean(GoogleBooksService.class);
            assertNull(service.search("fiction", 10, 0).items());
            assertTrue(service.search("fiction", 10, 0).items().isEmpty());
            assertNull(service.search("fiction", 10, 0));
            assertSame(successful, service.search("fiction", 10, 0));
            assertSame(successful, service.search("fiction", 10, 0));
            verify(client, times(4)).search("fiction", 10, 0);
        }
    }
}
