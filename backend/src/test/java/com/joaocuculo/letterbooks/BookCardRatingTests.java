package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.dto.external.*;
import com.joaocuculo.letterbooks.dto.request.BookSearchRequestDTO;
import com.joaocuculo.letterbooks.mapper.BookMapper;
import com.joaocuculo.letterbooks.entities.Book;
import com.joaocuculo.letterbooks.repositories.*;
import com.joaocuculo.letterbooks.repositories.projections.BookRatingAverage;
import com.joaocuculo.letterbooks.services.*;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class BookCardRatingTests {
    private final GoogleBooksService google = mock(GoogleBooksService.class);
    private final BookRepository books = mock(BookRepository.class);
    private final UserBookRepository userBooks = mock(UserBookRepository.class);
    private final RatingRepository ratings = mock(RatingRepository.class);
    private final RatingSummaryService summaries = new RatingSummaryService(ratings);

    @Test void paginatedSearchAddsPublicAveragesInOneBatchWithoutPersistingBooks() {
        when(google.search("books", 20, 20)).thenReturn(new GoogleBooksSearchResponseDTO(100,
                List.of(external("rated"), external("external"), external("unrated"))));
        when(ratings.findAveragesByGoogleBooksIds(List.of("rated", "external", "unrated")))
                .thenReturn(List.of(average("rated", 4.25)));
        var service = new BookService(books, google, null, null, userBooks, summaries);
        var page = service.search(request(), PageRequest.of(1, 20), null);
        assertEquals(100, page.getTotalElements());
        assertEquals(1, page.getNumber());
        assertEquals(4.25, page.getContent().getFirst().averageRating());
        assertNull(page.getContent().get(1).averageRating());
        assertNull(page.getContent().get(2).averageRating());
        verify(ratings).findAveragesByGoogleBooksIds(List.of("rated", "external", "unrated"));
        verifyNoMoreInteractions(ratings);
        verifyNoInteractions(books, userBooks);
    }

    @Test void localFallbackAlsoUsesOneBatchAndPreservesPagination() {
        Book book = new Book(); book.setGoogleBooksId("local"); book.setTitle("Local");
        when(books.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(book), PageRequest.of(0, 20), 31));
        when(ratings.findAveragesByGoogleBooksIds(List.of("local"))).thenReturn(List.of(average("local", 5)));
        var service = new BookService(books, google, null, null, userBooks, summaries);
        var result = service.search(request(), PageRequest.of(0, 20), 7L);
        assertEquals(31, result.getTotalElements());
        assertEquals(5.0, result.getContent().getFirst().averageRating());
        verify(ratings).findAveragesByGoogleBooksIds(List.of("local"));
        verify(books, never()).save(any());
    }

    @Test void allDiscoverSectionsShareOneDeduplicatedAggregationForGuestsAndMembers() {
        when(google.search("fiction", 12, 0)).thenReturn(response("rated", "external"));
        when(google.search("technology", 12, 0)).thenReturn(response("rated", "technology"));
        when(google.search("biographies", 12, 0)).thenReturn(response("biography"));
        var ids = List.of("rated", "external", "technology", "biography");
        when(ratings.findAveragesByGoogleBooksIds(ids)).thenReturn(List.of(average("rated", 4.5)));
        var service = new DiscoverService(google, userBooks, books, summaries);
        var guest = service.discover(null);
        var member = service.discover(7L);
        assertEquals(3, guest.sections().size());
        assertEquals(4.5, guest.sections().getFirst().books().getFirst().averageRating());
        assertEquals(4.5, guest.sections().get(1).books().getFirst().averageRating());
        assertNull(guest.sections().getFirst().books().get(1).averageRating());
        assertEquals(guest, member);
        verify(ratings, times(2)).findAveragesByGoogleBooksIds(ids);
        verifyNoMoreInteractions(ratings);
        verifyNoInteractions(books);
    }

    @Test void emptySearchDoesNotQueryRatings() {
        when(google.search("books", 20, 0)).thenReturn(new GoogleBooksSearchResponseDTO(0, List.of()));
        var service = new BookService(books, google, null, null, userBooks, summaries);
        assertTrue(service.search(request(), PageRequest.of(0, 20), null).isEmpty());
        verifyNoInteractions(ratings, books, userBooks);
    }

    @Test void cardJsonIncludesNullForMissingAverageAndPreservesOtherFields() {
        var mapper = tools.jackson.databind.json.JsonMapper.builder().build();
        var card = BookMapper.toCardResponseDTO(external("external"), true, 7L);
        var json = mapper.readTree(mapper.writeValueAsString(card));
        assertTrue(json.has("averageRating"));
        assertTrue(json.get("averageRating").isNull());
        assertEquals("external", json.get("id").asString());
        assertTrue(json.get("isFavorite").asBoolean());
        assertEquals(7L, json.get("userBookId").asLong());
        var rated = mapper.readTree(mapper.writeValueAsString(BookMapper.withAverageRating(card, 13.0 / 3)));
        assertEquals(13.0 / 3, rated.get("averageRating").asDouble(), 0.000001);
    }

    private BookSearchRequestDTO request() { return new BookSearchRequestDTO(null, null, null, null, null, "books"); }
    private GoogleBooksResponseDTO external(String id) {
        return new GoogleBooksResponseDTO(id, new GoogleBooksResponseDTO.VolumeInfo(
                "Livro " + id, null, List.of("Autor"), null, null, null, null, null, null, null, null, null));
    }
    private GoogleBooksSearchResponseDTO response(String... ids) {
        return new GoogleBooksSearchResponseDTO(ids.length, java.util.Arrays.stream(ids).map(this::external).toList());
    }
    private BookRatingAverage average(String id, double value) {
        return new BookRatingAverage() {
            public String getGoogleBooksId() { return id; }
            public Double getAverageRating() { return value; }
        };
    }
}
