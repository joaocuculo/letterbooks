package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.client.GoogleBooksClient;
import com.joaocuculo.letterbooks.dto.external.GoogleBooksSearchResponseDTO;
import com.joaocuculo.letterbooks.dto.request.BookSearchRequestDTO;
import com.joaocuculo.letterbooks.repositories.BookRepository;
import com.joaocuculo.letterbooks.services.BookService;
import com.joaocuculo.letterbooks.services.DiscoverService;
import com.joaocuculo.letterbooks.services.GoogleBooksService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(OutputCaptureExtension.class)
class GoogleBooksSearchTests {

    @Test
    void unavailableGoogleReturnsNullForLocalFallback() {
        GoogleBooksClient client = clientWithResponse(HttpStatus.SERVICE_UNAVAILABLE,
                "{\"error\":{\"message\":\"Service temporarily unavailable.\"}}");

        assertNull(client.search("fiction", 10, 0));
    }

    @Test
    void successfulSearchWithoutItemsIsNotAnExternalFailure() {
        GoogleBooksClient client = clientWithResponse(HttpStatus.OK, "{\"totalItems\":0}");

        GoogleBooksSearchResponseDTO response = client.search("fiction", 10, 0);

        assertNotNull(response);
        assertEquals(0, response.totalItems());
        assertNull(response.items());
    }

    @Test
    void errorLogIncludesGoogleResponseWithoutApiKey(CapturedOutput output) {
        GoogleBooksClient client = clientWithResponse(HttpStatus.SERVICE_UNAVAILABLE,
                "{\"error\":{\"message\":\"Service temporarily unavailable. test-key\"}}");

        assertNull(client.search("fiction", 10, 0));
        assertTrue(output.getOut().contains("HTTP 503"));
        assertTrue(output.getOut().contains("Service temporarily unavailable."));
        assertFalse(output.getOut().contains("test-key"));
    }

    @Test
    void stalledSearchReturnsNullAndLogsTimeout(CapturedOutput output) {
        WebClient webClient = WebClient.builder()
                .baseUrl("https://www.googleapis.com/books/v1")
                .exchangeFunction(request -> Mono.never())
                .build();
        GoogleBooksClient client = new GoogleBooksClient(webClient);
        ReflectionTestUtils.setField(client, "apiKey", "test-key");

        assertNull(client.search("fiction", 10, 0));
        assertTrue(output.getOut().contains("excedeu 5 segundos"));
    }

    @Test
    void zeroGoogleResultsDoNotTriggerLocalSearch() {
        GoogleBooksService googleBooksService = mock(GoogleBooksService.class);
        BookRepository bookRepository = mock(BookRepository.class);
        when(googleBooksService.search(anyString(), anyInt(), anyInt()))
                .thenReturn(new GoogleBooksSearchResponseDTO(0, null));
        BookService service = new BookService(bookRepository, googleBooksService, null, null, null);
        BookSearchRequestDTO request = new BookSearchRequestDTO(null, null, null, null, null, "fiction");

        assertTrue(service.search(request, PageRequest.of(0, 10), null).isEmpty());
        verifyNoInteractions(bookRepository);
    }

    @Test
    void discoverSkipsEmptyAndUnavailableSections() {
        GoogleBooksService googleBooksService = mock(GoogleBooksService.class);
        when(googleBooksService.search(anyString(), anyInt(), anyInt()))
                .thenReturn(new GoogleBooksSearchResponseDTO(0, null), null,
                        new GoogleBooksSearchResponseDTO(0, java.util.List.of()));

        assertTrue(new DiscoverService(googleBooksService, null).discover(null).sections().isEmpty());
        verify(googleBooksService, times(3)).search(anyString(), eq(10), eq(0));
    }

    private GoogleBooksClient clientWithResponse(HttpStatus status, String body) {
        WebClient webClient = WebClient.builder()
                .baseUrl("https://www.googleapis.com/books/v1")
                .exchangeFunction(request -> Mono.just(ClientResponse.create(status)
                        .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                        .body(body)
                        .build()))
                .build();
        GoogleBooksClient client = new GoogleBooksClient(webClient);
        ReflectionTestUtils.setField(client, "apiKey", "test-key");
        return client;
    }
}
